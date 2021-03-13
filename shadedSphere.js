// CS 147 Assignment #5
// note that you do not need to touch any code in the .js file for this assignment

"use strict";

var shadedSphere = function() {
var canvas;
var gl;

var phongFragmentShading = false;

var numTimesToSubdivide = 3;

var index = 0;

var positionsArray = [];
var normalsArray = [];


var near = -10;
var far = 10;
var radius = 1.5;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var top =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightPosition = vec4(1.0, 1.0, 1.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 20.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;


var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);



function triangle(a, b, c) {

    positionsArray.push(a);
    positionsArray.push(b);
    positionsArray.push(c);

         // normals are vectors

    normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
    normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
    normalsArray.push(vec4(c[0],c[1], c[2], 0.0));


    index += 3;
}

function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else {
        triangle(a, b, c);
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //

    if (phongFragmentShading == true)
    {
        var program = initShaders( gl, "vertex-shader-phong", "fragment-shader-phong" );
    }
    else {
        var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    }

    gl.useProgram(program);


    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");


    document.getElementById("lsliderphi").onchange = function(event) {
        phi = event.target.value;
        document.getElementById("lsliderphiText").innerHTML = event.target.value; //update html text

        init();
    };

    document.getElementById("lslidertheta").onchange = function(event) {
        theta = event.target.value;
        document.getElementById("lsliderthetaText").innerHTML = event.target.value; //update html text
        init();
    };


    document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = event.target.value;
        index = 0;
        positionsArray = [];
        normalsArray = [];
        document.getElementById("subdivisionsText").innerHTML = event.target.value; //update html text
        init();
    };


    document.getElementById("Controls" ).onclick = function(event) {
        switch( event.target.index ) {
          case 0:
            phongFragmentShading = false;
            break;
         case 1:
            phongFragmentShading = true;
            break;
       }
       init();
    };

    document.getElementById("ambientR").onchange = function(event) {
        materialAmbient[0] = event.target.value;
        document.getElementById("ambientRedMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("ambientG").onchange = function(event) {
        materialAmbient[1] = event.target.value;
        document.getElementById("ambientGreenMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("ambientB").onchange = function(event) {
        materialAmbient[2] = event.target.value;
        document.getElementById("ambientBlueMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseR").onchange = function(event) {
        materialDiffuse[0] = event.target.value;
        document.getElementById("diffuseRedMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseG").onchange = function(event) {
        materialDiffuse[1] = event.target.value;
        document.getElementById("diffuseGreenMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseB").onchange = function(event) {
        materialDiffuse[2] = event.target.value;
        document.getElementById("diffuseBlueMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularR").onchange = function(event) {
        materialSpecular[0] = event.target.value;
        document.getElementById("specularRedMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularG").onchange = function(event) {
        materialSpecular[1] = event.target.value;
        document.getElementById("specularGreenMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularB").onchange = function(event) {
        materialSpecular[2] = event.target.value;
        document.getElementById("specularBlueMText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("shininessSlider").onchange = function(event) {
        materialShininess = event.target.value;
        document.getElementById("shininessText").innerHTML = event.target.value; //update html text
        init();
    };


    //light stuff here

   document.getElementById("ambientRlight").onchange = function(event) {
        lightAmbient[0] = event.target.value;
        document.getElementById("ambientRedLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("ambientGlight").onchange = function(event) {
        lightAmbient[1] = event.target.value;
        document.getElementById("ambientGreenLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("ambientBlight").onchange = function(event) {
        lightAmbient[2] = event.target.value;
        document.getElementById("ambientBlueLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseRlight").onchange = function(event) {
        lightDiffuse[0] = event.target.value;
        document.getElementById("diffuseRedLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseGlight").onchange = function(event) {
        lightDiffuse[1] = event.target.value;
        document.getElementById("diffuseGreenLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("diffuseBlight").onchange = function(event) {
        lightDiffuse[2] = event.target.value;
        document.getElementById("diffuseBlueLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularRlight").onchange = function(event) {
        lightSpecular[0] = event.target.value;
        document.getElementById("specularRedLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularGlight").onchange = function(event) {
        lightSpecular[1] = event.target.value;
        document.getElementById("specularGreenLText").innerHTML = event.target.value; //update html text
        init();
    };

    document.getElementById("specularBlight").onchange = function(event) {
        lightSpecular[2] = event.target.value;
        document.getElementById("specularBlueLText").innerHTML = event.target.value; //update html text
        init();
    };    

    lightPosition[0] = radius*Math.sin(theta);
    lightPosition[1] = radius*Math.sin(phi);
    lightPosition[2] = radius;


    gl.uniform4fv( gl.getUniformLocation(program,
       "uAmbientProduct"), ambientProduct );
    gl.uniform4fv( gl.getUniformLocation(program,
       "uDiffuseProduct"), diffuseProduct );
    gl.uniform4fv( gl.getUniformLocation(program,
       "uSpecularProduct"), specularProduct );
    gl.uniform4fv( gl.getUniformLocation(program,
       "uLightPosition"), lightPosition );
    gl.uniform1f( gl.getUniformLocation(program,
       "uShininess"),materialShininess );

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, top, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    requestAnimationFrame(render);
}

}

shadedSphere();
