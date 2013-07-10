# Utilities

Uint8Array.prototype.max = ->
  max = this[0]
  for item in this
    if item > max
      max = item
  max

Uint8Array.prototype.sum = ->
  sum = 0
  for item in this
    sum += item
  sum

Uint8Array.prototype.average = ->
  @sum() / this.length

class Node
  constructor: (@name, @parent) ->
    @children = []
    @channels = []
    @initialOffset = new THREE.Vector3
    @translation = new THREE.Vector3
    @rotation = new THREE.Vector3
    @matrix = new THREE.Matrix4
    @globalMatrix = new THREE.Matrix4
  
  isRoot: ->
    !@parent
  
  isSite: ->
    @children.length == 0
  
  update: (index, frame)  ->
    @translation.set 0, 0, 0
    @rotation.set 0, 0, 0
    for channel in @channels
      v = frame[index]
      switch channel
        when "Xposition" then @translation.x = v
        when "Yposition" then @translation.y = v
        when "Zposition" then @translation.z = v
        when "Xrotation" then @rotation.x = v * Math.PI / 180
        when "Yrotation" then @rotation.y = v * Math.PI / 180
        when "Zrotation" then @rotation.z = v * Math.PI / 180
      index++
    
    @translation.addSelf @initialOffset
    
    @matrix.identity()
    @matrix.translate @translation
    @matrix.setRotationFromEuler @rotation, 'YXZ'
    
    @globalMatrix.copy @matrix
    @globalMatrix.multiplySelf @parent.globalMatrix if @parent

    index = child.update index, frame for child in @children

    index
  
  cout: (indent = "") ->
    console.log(indent + @name + " " +
      @channels.length + " channels " +
      "(" + @initialOffset.x + ", " + @initialOffset.x + ", " + @initialOffset.z + ")"
    )

    child.cout("  " + indent) for child in @children

class Bvh
  constructor: (@root) ->
    @frames = []
    @joints = []
  
  update: (pos) ->
    if pos >= 0 && pos < @frames.length
      frame = @frames[pos]
      @root.update 0, frame

class Parser
  constructor: (@data) ->
  
  parse: ->
    lines = @data.split("\n")
    i = 0
    bvh = null
    joint = null
    done = false
    
    while line = lines[i++]
      line = line.replace /^\s+|\s+$/, ""
      fields = line.split " "
      switch fields[0]
        when "ROOT"
          joint = new Node fields[1]
          bvh = new Bvh joint
          bvh.joints.push joint
        when "JOINT", "End"
          joint = new Node fields[1], joint
          joint.parent.children.push joint
          bvh.joints.push joint
        when "OFFSET"
          ox = parseFloat fields[1]
          oy = parseFloat fields[2]
          oz = parseFloat fields[3]
          joint.initialOffset.set ox, oy, oz
        when "CHANNELS"
          if fields.length > 2
            joint.channels.push field for field in fields[2..]
        when "}"
          joint = joint.parent
          if !joint
            done = true
      
      break if done
    
    frameCount = 0
    while line = lines[i++]
      fields = line.split " "
      if fields[0] == "Frames:"
        frameCount = parseInt fields[1]
      else if fields[0] == "Frame"
        bvh.frameTime = parseFloat fields[2]
        break
    
    console.log("Frame count: " + frameCount + ", frame time: " + bvh.frameTime + ", total time: " + frameCount * bvh.frameTime)

    while line = lines[i++]
      fields = line.split " "
      frame = []
      if fields.length > 0
        frame.push parseFloat(field) for field in fields
        bvh.frames.push frame

    throw "Invalid frames! frame count: " + frameCount + ", bvh: " + bvh.frames.length unless frameCount == bvh.frames.length

    bvh

class SoundPlayer
  constructor: (@file) ->
  
  init: (callback) ->
    @context = new (window.WindowAudioContext || window.webkitAudioContext)
    xhr = new XMLHttpRequest
    xhr.open 'GET', @file, true
    xhr.responseType = 'arraybuffer'
    xhr.onload = =>
      @context.decodeAudioData xhr.response,
        (buffer) =>
          @buffer = buffer
          callback()
        , ->
          console.log "Failed to load sounds."
    xhr.send()
  
  play: ->
    @source = @context.createBufferSource()
    @source.buffer = @buffer
    @analyser = @context.createAnalyser()
    @source.connect @analyser
    @analyser.connect @context.destination
    
    @source.noteOn 0
  
  isReady: ->
    !!this.source
  
  fft: ->
    freqByteData = new Uint8Array @analyser.frequencyBinCount
    @analyser.getByteFrequencyData freqByteData
    freqByteData

  volume: ->
    @fft().average()

class Perfume
  constructor: ->
    @objects = []
    @radius = 300
    @theta = 0
    @mouseX = 0
    @mouseY = 0
    @bvhs = []
    @prevPos = 1000000000
  
  start: ->
    @startTime = new Date().getTime()
    @animate()

  addBvh: (bvh) ->
    @bvhs.push bvh
    bvh.objects = []
    @addNode bvh.root, @scene, bvh.objects
  
  createLine: (x1, y1, z1, x2, y2, z2, color) ->
    mat = new THREE.LineBasicMaterial({
      color: color || 0x999999,
      opacity: 1.0,
      linewidth: 1,
      blending: THREE.AdditiveBlending
    })
    geo = new THREE.Geometry
    geo.vertices.push new THREE.Vertex(new THREE.Vector3(x1, y1, z1))
    geo.vertices.push new THREE.Vertex(new THREE.Vector3(x2, y2, z2))
    line = new THREE.Line geo, mat
    line
  
  init: ->
    @container = document.createElement 'div'
    document.body.appendChild @container
    
    @scene = new THREE.Scene
    
    # Add camera
    @camera = new THREE.PerspectiveCamera 70, window.innerWidth / window.innerHeight, 1, 10000
    @camera.position.set 0, 300, 500
    @scene.add @camera
    
    # Add grounds
    num = 256
    @grounds = []
    for i in [0...num]
      angle = i * Math.PI * 2 / num + Math.PI
      color = new THREE.Color().setHSV(i / num, 1, 0.8).getHex()
      line = @createLine 0, 0, 0, 100 * Math.cos(angle), 0, 100 * Math.sin(angle), color
      @scene.add line
      @grounds.push line

    # Add lights
    light = new THREE.DirectionalLight 0xffffff, 2
    light.position.set(1, 1, 1).normalize()
    @scene.add light

    light = new THREE.DirectionalLight 0xffffff
    light.position.set(-1, -1, -1).normalize()
    @scene.add light

    @projector = new THREE.Projector

    # Add renderer
    @renderer = new THREE.WebGLRenderer
    @renderer.sortObjects = false
    @renderer.setSize window.innerWidth, window.innerHeight
    @container.appendChild @renderer.domElement
    
    # Add stats
    @stats = new Stats
    @stats.domElement.style.position = 'absolute'
    @stats.domElement.style.top = '0px'
    @container.appendChild @stats.domElement
    
    window.addEventListener 'resize', @onResize

  onResize: (e) =>
    w = window.innerWidth
    h = window.innerHeight
    @renderer.setSize w, h
    @camera.aspect = w / h
    @camera.updateProjectionMatrix()

  addNode: (joint, parentNode, objects) ->
    color = null
    if joint.isRoot()
      color = 0xff0000
    else if joint.isSite()
      color = 0xffff00
    else
      color = 0xffffff
    
    geometry = new THREE.CubeGeometry 5, 5, 5
    material = new THREE.MeshLambertMaterial { color: color }
    object = new THREE.Mesh geometry, material
    object.eulerOrder = 'YXZ'
    
    parentNode.add object
    objects.push object

    for child in joint.children
      @addNode child, object, objects
      
      mat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 1.0,
        linewidth: 1,
        blending: THREE.AdditiveBlending
      })
      geo = new THREE.Geometry
      geo.vertices.push new THREE.Vertex(new THREE.Vector3)
      geo.vertices.push new THREE.Vertex(child.initialOffset)
      line = new THREE.Line geo, mat
      object.add line
  
  animate: =>
    window.requestAnimationFrame @animate
    
    dt = new Date().getTime() - @startTime
    frameCount = @bvhs[0].frames.length
    frameTime = @bvhs[0].frameTime
    pos = Math.floor(dt / 1000.0 / frameTime) % frameCount
    
    @audio.play() if pos < @prevPos
    @prevPos = pos
    
    fft = @audio.fft()
    for i in [0...256]
      vol = Math.pow(fft[i] / 255, 2) * 5
      @grounds[i].scale.set vol, 1, vol

    for bvh in @bvhs
      bvh.update pos
      for joint, i in bvh.joints
        object = bvh.objects[i]
        
        object.position.copy joint.translation
        object.rotation.copy joint.rotation
    
    @render()
    @stats.update()

  render: ->
    $window = $(window)
    @camera.position.x = @radius * Math.sin(Math.PI * 2 * @mouseX / $window.width())
    @camera.position.y = @radius * Math.cos(Math.PI / 2 * @mouseY / $window.height())
    @camera.position.z = @radius * Math.cos(Math.PI * 2 * @mouseX / $window.width())

    @camera.lookAt @scene.position

    @renderer.render @scene, @camera
  
  onMouseMove: (e) =>
    @mouseX = e.pageX
    @mouseY = e.pageY

jQuery(($) ->
  perfume = new Perfume
  perfume.init()
  
  $(document).mousemove perfume.onMouseMove

  loaded = 0
  resourceLoaded = ->
  	loaded++
  	perfume.start() if loaded == 4
  
  loadBvh = (path) ->
    $.get(path, (data) ->
      parser = new Parser data
      bvh = parser.parse()
      bvh.update()
      bvh.root.cout()
      
      perfume.addBvh bvh
      
      resourceLoaded()
    )
  
  loadBvh "../data/bvhfiles/aachan.bvh"
  loadBvh "../data/bvhfiles/kashiyuka.bvh"
  loadBvh "../data/bvhfiles/nocchi.bvh"
  
  soundPlayer = new SoundPlayer "../data/Perfume_globalsite_sound.wav"
  perfume.audio = soundPlayer
  soundPlayer.init resourceLoaded
)
