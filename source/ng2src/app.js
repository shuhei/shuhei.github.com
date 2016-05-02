'use strict';

(function() {
  class GraphChart {
    constructor() {
      this.w = window.innerWidth;
      this.h = window.innerHeight;

      this.selectedNodes = null;
      this.selectedNode = null;
    }

    start() {
      d3.json('./ng2.json', graph => this.draw(graph));
    }

    buildArrowDef() {
      // Build the arrow.
      this.vis.append('svg:defs').selectAll('marker')
        .data(['end'])
      .enter().append('marker')
        .attr('id', String)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
      .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');
    }

    translate(x, y) {
      return 'translate(' + x + ',' + y + ')';
    }

    preprocessGraph(graph) {
      this.nodes = graph.nodes.map((node, i) => {
        const name = node.name;
        const isDepended = graph.links.filter(link => link[1] === i).length > 0;
        const isDepending = graph.links.filter(link => link[0] === i).length > 0;
        const components = name.split('/');
        const group = components[1] === 'src' ? components[2] : components[1];
        return {
          isDepended: isDepended,
          isDepending: isDepending,
          label: name,
          group: group,
          size: node.size,
          exports: node.exports
        };
      });

      this.links = graph.links.map(link => {
        return {
          source: link[0],
          target: link[1],
          weight: 1
        };
      });
    }

    nodeClass(d) {
      if (!d.isDepended) { return 'top-level'; }
      if (!d.isDepending) { return 'independent'; }
      return 'normal';
    }

    draw(graph) {
      this.preprocessGraph(graph);

      const color = d3.scale.category20c();

      const zoom = d3.behavior.zoom()
        .center([this.w / 2, this.h / 2])
        .scaleExtent([0.2, 10])
        .on('zoom', () => {
          this.wrapper.attr('transform',
                            `translate(${d3.event.translate}) scale(${d3.event.scale})`);
        });

      this.vis = d3.select('#vis')
        .attr('width', this.w)
        .attr('height', this.h)
        .call(zoom);
      this.buildArrowDef();

      // Wrapper
      this.wrapper = this.vis
        .append('svg:g')
        .attr('class', 'wrapper');

      // Force
      const force = d3.layout.force()
        .size([this.w, this.h])
        .nodes(this.nodes)
        .links(this.links)
        .gravity(1)
        .linkDistance(70)
        .charge(-1700)
        .linkStrength(10);
      force.start();

      // Links
      this.link = this.wrapper.selectAll('line.link')
        .data(this.links)
      .enter()
        .append('svg:line')
        .attr('marker-end', 'url(#end)');

      // Tooltip
      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      // Node
      this.node = this.wrapper.selectAll('g.node')
        .data(this.nodes)
      .enter()
        .append('svg:g')
        .attr('class', 'node');
      this.node.append('svg:circle')
        .style('fill', d => d.size ? color(d.group) : '#333')
        .attr('r', d => d.size ? Math.sqrt(d.size) * 0.08 : 10);
      this.node
        .on('mouseover', d => {
          tooltip.transition()
            .duration(100)
            .style('opacity', 0.9);
          tooltip.text(d.label)
            .style('left', `${d3.event.pageX + 5}px`)
            .style('top', `${d3.event.pageY - 30}px`);
        })
        .on('mouseout', d => {
          tooltip.transition()
            .duration(100)
            .style('opacity', 0);
        })
        .on('click', d => {
          d3.event.stopPropagation();
          this.selectNode(d);
        })
        .on('contextmenu', d => {
          if (d.label.startsWith('angular2')) {
            window.open(`https://github.com/angular/angular/tree/master/modules/${d.label}.ts`);
          } else {
            window.open(`https://www.npmjs.com/package/${d.label}`);
          }
        });;
      this.node.call(force.drag);

      d3.select(document.body).on('mousedown', () => this.clearSelected());
      d3.select(window).on('keydown', () => {
        // ESC
        if (d3.event.keyCode === 27) {
          this.clearSelected();
        }
      });

      this.updateClasses();

      force.on('tick', () => this.updatePositions());
    }

    findRelated(startNode) {
      const result = [startNode.index];

      this.searchDownstream(startNode, result);
      // this.searchUpstream(startNode, result);

      return result;
    }

    searchDownstream(node, result) {
      this.links.forEach(link => {
        if (link.source.index === node.index && result.indexOf(link.target.index) < 0) {
          result.push(link.target.index);
          this.searchDownstream(link.target, result);
        }
      });
    }

    searchUpstream(node, result) {
      this.links.forEach(link => {
        if (link.target.index == node.index && result.indexOf(link.source.index) < 0) {
          result.push(link.source.index);
          this.searchUpstream(link.source, result);
        }
      });
    }

    selectNode(d) {
      this.selectedNode = d.index;
      this.selectedNodes = this.findRelated(d);

      this.updateClasses();
    }

    clearSelected() {
      this.selectedNode = null;
      this.selectedNodes = null;

      this.updateClasses();
    }

    updatePositions() {
      this.node
        .attr('transform', d => this.translate(d.x, d.y));
      this.link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    }

    updateClasses() {
      this.node.attr('class', d => {
        const result = [this.nodeClass(d)];
        if (this.selectedNode === d.index) {
          result.push('node-selected');
        } else if (!this.selectedNodes || this.selectedNodes.includes(d.index)) {
          result.push('node-active');
        } else {
          result.push('node-inactive');
        }
        return result.join(' ');
      });

      this.link.attr('class', d => {
        const isActive = !this.selectedNodes || (
          this.selectedNodes.includes(d.source.index) &&
          this.selectedNodes.includes(d.target.index)
        );
        return 'link ' + (isActive ? 'active' : 'inactive');
      });
    }
  }

  new GraphChart().start();
})();
