---
title: "Snake"
icon: fas fa-dragon
layout: page
permalink: /snake/
order: 3
---

<canvas id="game" width="600" height="600"/>
<script src="{{ site.baseurl }}/assets/js/snake.js"></script>
<style>
    body{
        margin: 0px
        padding: 0px
        display: flex;
        flex-direction: column; /* Arrange items on top */
        justify-content: center;
        align-items: center;
    }
    canvas{
        box-shadow: black 20px 10px 50px; /*elevate our canvas and add shadow*/
}
</style>