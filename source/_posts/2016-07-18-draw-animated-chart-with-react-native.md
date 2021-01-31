---
layout: post
title: "Draw animated chart on React Native"
tags: [JavaScript, React]
---

At [Meguro.es #4](http://meguroes.connpass.com/event/32167/) on June 21th, 2016, I talked about drawing animated chart on [React Native](https://facebook.github.io/react-native/). The talk was about the things I learned through developing an tiny app, Compare. It's a super simple app to compare temperatures.

Before creating it, I had no idea about what temperatures on weather forecast, like 15 degrees Celsius, were actually like. I remember what yesterday was like, but not the numbers. Typical weather forecast apps shows only future temperatures without past records. Thanks to [The Dark Sky Forecast API](https://developer.forecast.io/), the app fetches both of past records and future forecasts, and show them together.

![Compare app](/images/compare-animated.gif)

The app's source code is on GitHub:

[shuhei/Compare](https://github.com/shuhei/Compare)

There might have been some charting libraries to draw similar charts, but I like to write things from scratch. I like to reinvent the wheel especially when it's a side project. Thanks to that, I found a way to animate smooth paths with the `Animated` library.

<script async class="speakerdeck-embed" data-id="3deb649c92814572ac3412a78bb5b688" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

If I have to add something to the slides:

- It's fun to develop on React Native, and super easy to start. If you know React and CSS, you can apply your familiar ideas to mobile app development. And they are actually powerful.
- [Jason Brown's JavaScript without Grammar](http://browniefed.com/) is an awesome blog. It has lots of articles about React Native and animation on it, which taught me a lot. Also, I found the awesomeness of `LayoutAnimation` at [Justin Poliachik's React Native’s LayoutAnimation is Awesome](https://medium.com/@Jpoliachik/react-native-s-layoutanimation-is-awesome-4a4d317afd3e#.5tnprrm80), which is a great post too.
