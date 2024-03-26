var gl;
var shaderProgram;
var uPMatrix;
var vertexPositionBuffer;
var vertexColorBuffer;

function MatrixMul(a,b) //Mnożenie macierzy
{
  c = [
  0,0,0,0,
  0,0,0,0,
  0,0,0,0,
  0,0,0,0
  ];
  for(let i=0;i<4;i++)
  {
    for(let j=0;j<4;j++)
    {
      c[i*4+j] = 0.0;
      for(let k=0;k<4;k++)
      {
        c[i*4+j]+= a[i*4+k] * b[k*4+j];
      }
    }
  }


  return c;
}

function PlaceCube(x,y,z, cub){
  x*=2;
  y*=2;
  z*=2;

  let vertexPosition1 = [
    //Top
    x-1.0, y+1.0, z-1.0,  x-1.0, y+1.0, z+1.0,  x+1.0, y+1.0, z+1.0, //3 punkty po 3 składowe - X1,Y1,Z1, X2,Y2,Z2, X3,Y3,Z3 - 1 trójkąt
    x-1.0, y+1.0, z-1.0,  x+1.0, y+1.0, z+1.0,  x+1.0, y+1.0, z-1.0,
    //Left
    x-1.0, y-1.0, z+1.0,  x-1.0, y+1.0, z+1.0,  x-1.0, y-1.0, z-1.0,
    x-1.0, y-1.0, z-1.0,  x-1.0, y+1.0, z+1.0,  x-1.0, y+1.0, z-1.0,
    //Right
    x+1.0, y+1.0, z+1.0,  x+1.0, y-1.0, z+1.0,  x+1.0, y-1.0, z-1.0,
    x+1.0, y+1.0, z+1.0,  x+1.0, y-1.0, z-1.0,  x+1.0, y+1.0, z-1.0,
    //Front
    x+1.0, y-1.0, z+1.0,  x+1.0, y+1.0, z+1.0,  x-1.0, y-1.0, z+1.0,
    x-1.0, y+1.0, z+1.0,  x-1.0, y-1.0, z+1.0,  x+1.0, y+1.0, z+1.0,
    //Back
    x+1.0, y+1.0, z-1.0,  x+1.0, y-1.0, z-1.0,  x-1.0, y-1.0, z-1.0,
    x+1.0, y+1.0, z-1.0,  x-1.0, y-1.0, z-1.0,  x-1.0, y+1.0, z-1.0,
    //Bottom
    x-1.0, y-1.0, z+1.0,  x-1.0, y-1.0, z-1.0,  x+1.0, y-1.0, z+1.0,
    x+1.0, y-1.0, z+1.0,  x-1.0, y-1.0, z-1.0,  x+1.0, y-1.0, z-1.0
    ]

    //Opis sceny 3D, kolor każdego z wierzchołków
  let vertexColor1 = [
  //Top
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, //3 punkty po 3 składowe - R1,G1,B1, R2,G2,B2, R3,G3,B3 - 1 trójkąt
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
  //Left
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
  //Right
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
  //Front
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,
  //Back
    1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,
    1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,
  //Bottom
    0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
    0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
  ]

  cub.pos = [...cub.pos, ...vertexPosition1];
  cub.col = [...cub.col, ...vertexColor1];
  cub.counter += 12;
  //alert(vertexCounter);
}


function startGL() 
{
  alert("W moim programie przygotowałem dwa schematy sterowania, przłączać się między nimi można przyciskiem F\n\n Domyślnie schemat A (w stylu gier FPS):\nObrót kamery: przyciski A i D\n poruszanie się w lini którą jest zwrócona kamera: przyciski W i S\n\n schemat B:\n Obrót kamery: W, S, A, D\n poruszanie się w lini z świata: I i K\n poruszanie się w lini x świata: J i L");
  let canvas = document.getElementById("canvas3D"); //wyszukanie obiektu w strukturze strony 
  gl = canvas.getContext("experimental-webgl"); //pobranie kontekstu OpenGL'u z obiektu canvas
  gl.viewportWidth = canvas.width; //przypisanie wybranej przez nas rozdzielczości do systemu OpenGL
  gl.viewportHeight = canvas.height;
  
    //Kod shaderów
  const vertextShaderSource = ` //Znak akcentu z przycisku tyldy - na lewo od przycisku 1 na klawiaturze
    precision highp float;
    attribute vec3 aVertexPosition; 
    attribute vec3 aVertexColor;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    varying vec3 vColor;
    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); //Dokonanie transformacji położenia punktów z przestrzeni 3D do przestrzeni obrazu (2D)
      vColor = aVertexColor;
    }
  `;
  const fragmentShaderSource = `
    precision highp float;
    varying vec3 vColor;
    void main(void) {
      gl_FragColor = vec4(vColor,1.0); //Ustalenie stałego koloru wszystkich punktów sceny
    }
  `;
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //Stworzenie obiektu shadera 
  let vertexShader   = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource); //Podpięcie źródła kodu shader
  gl.shaderSource(vertexShader, vertextShaderSource);
  gl.compileShader(fragmentShader); //Kompilacja kodu shader
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) { //Sprawdzenie ewentualnych błedów kompilacji
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }
  
  shaderProgram = gl.createProgram(); //Stworzenie obiektu programu 
  gl.attachShader(shaderProgram, vertexShader); //Podpięcie obu shaderów do naszego programu wykonywanego na karcie graficznej
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Could not initialise shaders");  //Sprawdzenie ewentualnych błedów
  

  var addCube = {
    counter: 2,
    pos: [
      //floor
      -30.0, -1.0, +30.0,  -30.0, -1.0, -30.0,  +30.0, -1.0, +30.0,
      +30.0, -1.0, +30.0,  -30.0, -1.0, -30.0,  +30.0, -1.0, -30.0,
      ],
    col: [
      0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
      0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
    ]

  }

  //mapa labiryntu
  //# -> ściana
  //- -> wolna przestrzeń
  let labirynth = [ "#####-##############",
                    "#---#--#-------##--#",
                    "#-####-#-#####----##",
                    "#----#-#-----#--#--#",
                    "##-###-###-#-#####-#",
                    "#----------#---###-#",
                    "#-#####-####-###---#",
                    "#-#--------#########",
                    "#-########---------#",
                    "#-----#-#####-####-#",
                    "#-###-#--#--#-##-#-#",
                    "#####-##-#-##-##-#-#",
                    "#------#-#----#----#",
                    "#-#-#-##-#########-#",
                    "#-#-#--#-------#---#",
                    "#-#-####-####-###-##",
                    "#-#-------#----#---#",
                    "#-####-####-#-####-#",
                    "#----#------#------#",
                    "##########-#########" ]

  //pentle generujące labirynt na bazie mapy
  for(let i = -10; i < 10; i++){
    for(let j = -10; j< 10; j++){
      if(labirynth[i+10][j+10] === "#"){
        //console.log(i);
        PlaceCube(j,0,i, addCube);
      }
    }
  }

  let cubeCounter = addCube.counter;
  //Opis sceny 3D, położenie punktów w przestrzeni 3D w formacie X,Y,Z 
  let vertexPosition = addCube.pos;

  //Opis sceny 3D, kolor każdego z wierzchołków
  let vertexColor = addCube.col;

  
  console.log(vertexPosition);
  //alert(vertexColor)


  
  vertexPositionBuffer = gl.createBuffer(); //Stworzenie tablicy w pamieci karty graficznej
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3; //zdefiniowanie liczby współrzednych per wierzchołek
  vertexPositionBuffer.numItems = cubeCounter; //Zdefinoiowanie liczby punktów w naszym buforze
  
  
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 3;
  vertexColorBuffer.numItems = cubeCounter;
  
  
  //Macierze opisujące położenie wirtualnej kamery w przestrzenie 3D
  let aspect = gl.viewportWidth/gl.viewportHeight;
  let fov = 45.0 * Math.PI / 180.0; //Określenie pola widzenia kamery
  let zFar = 100.0; //Ustalenie zakresów renderowania sceny 3D (od obiektu najbliższego zNear do najdalszego zFar)
  let zNear = 0.1;
  uPMatrix = [
   1.0/(aspect*Math.tan(fov/2)),0                           ,0                         ,0                            ,
   0                         ,1.0/(Math.tan(fov/2))         ,0                         ,0                            ,
   0                         ,0                           ,-(zFar+zNear)/(zFar-zNear)  , -1,
   0                         ,0                           ,-(2*zFar*zNear)/(zFar-zNear) ,0.0,
  ];
  Tick();
} 
//let angle = 45.0; //Macierz transformacji świata - określenie położenia kamery

var angleZ = 0.0;
var angleY = 0.0;
var angleX = 0.0;
var trackAngleY = 0.0;
var alpha = 0.0;
var tx = 0.0;
var tz = -25.0;
var ty = 0.0;

function Tick()
{  
  

  let uMVMatrix = [
  1,0,0,0, //Macierz jednostkowa
  0,1,0,0,
  0,0,1,0,
  0,0,0,1
  ];
  

  let uMVRotZ = [
  +Math.cos(angleZ*Math.PI/180.0),+Math.sin(angleZ*Math.PI/180.0),0,0,
  -Math.sin(angleZ*Math.PI/180.0),+Math.cos(angleZ*Math.PI/180.0),0,0,
  0,0,1,0,
  0,0,0,1
  ];
  
  let uMVRotY = [
  +Math.cos(angleY*Math.PI/180.0),0,-Math.sin(angleY*Math.PI/180.0),0,
  0,1,0,0,
  +Math.sin(angleY*Math.PI/180.0),0,+Math.cos(angleY*Math.PI/180.0),0,
  0,0,0,1
  ];
  
  let uMVRotX = [
  1,0,0,0,
  0,+Math.cos(angleX*Math.PI/180.0),+Math.sin(angleX*Math.PI/180.0),0,
  0,-Math.sin(angleX*Math.PI/180.0),+Math.cos(angleX*Math.PI/180.0),0,
  0,0,0,1
  ];
  
  let uMVTranslate = [
  1,0,0,0,
  0,1,0,0,
  0,0,1,0,
  tx,ty,tz,1
  ];

  uPMatrix = MatrixMul(uMVRotX,uPMatrix);
  uPMatrix = MatrixMul(uMVRotY,uPMatrix);
  uPMatrix = MatrixMul(uMVRotZ,uPMatrix);
  uMVMatrix = MatrixMul(uMVMatrix,uMVTranslate);
  //alert(uPMatrix);
  
  //Render Scene
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); 
  gl.clearColor(1.0,0.0,0.0,1.0); //Wyczyszczenie obrazu kolorem czerwonym
  gl.clearDepth(1.0);             //Wyczyścienie bufora głebi najdalszym planem
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram)   //Użycie przygotowanego programu shaderowego
  
  gl.enable(gl.DEPTH_TEST);           // Włączenie testu głębi - obiekty bliższe mają przykrywać obiekty dalsze
  gl.depthFunc(gl.LEQUAL);            // 
  
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uPMatrix"), false, new Float32Array(uPMatrix)); //Wgranie macierzy kamery do pamięci karty graficznej
  gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uMVMatrix"), false, new Float32Array(uMVMatrix));
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));  //Przekazanie położenia
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexColor"));  //Przekazanie kolorów
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexColor"), vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numItems*vertexPositionBuffer.itemSize); //Faktyczne wywołanie rendrowania
  yaw = 0;
  setTimeout(Tick,1);

angleZ = 0.0;
angleY = 0.0;
angleX = 0.0;

}

var keyScheme = 1;
function handlekeydown(e)
{
  if(keyScheme === 1){
    if(e.keyCode==68){
      angleY=angleY+2.0; //D
    
      trackAngleY=trackAngleY+2.0;
     } 
     if(e.keyCode==65){
      angleY=angleY-2.0; //A
    
      trackAngleY=trackAngleY-2.0;
     } 
     if(e.keyCode==81) angleZ=angleZ+1.0;
     if(e.keyCode==69) angleZ=angleZ-1.0;
     if(e.keyCode==87){
      tx = tx - (0.5 * Math.sin(trackAngleY*Math.PI/180.0))
      tz = tz + (0.5 * Math.cos(trackAngleY*Math.PI/180.0))
      console.log("tx: " + tx);
      console.log("tz: " + tz);
     } 
     if(e.keyCode==83){
      tx = tx + (0.5 * Math.sin(trackAngleY*Math.PI/180.0))
      tz = tz - (0.5 * Math.cos(trackAngleY*Math.PI/180.0))
     } 
    
     if(e.keyCode==73){
      angleX=angleX+1.0; //I
     } 
     if(e.keyCode==75){
      angleX=angleX-1.0; //J
     } 
     if(e.keyCode==70){
      keyScheme = 0;
      alert("schemat sterowania B")
      return;
     } 
    }

    if(keyScheme === 0){
    
      if(e.keyCode==68) angleY=angleY+1.0;
      if(e.keyCode==65) angleY=angleY-1.0;
      if(e.keyCode==81) angleZ=angleZ+1.0;
      if(e.keyCode==69) angleZ=angleZ-1.0;
      if(e.keyCode==87) angleX=angleX+1.0;
      if(e.keyCode==83) angleX=angleX-1.0;
      if(e.keyCode==73) tz+=1;
      if(e.keyCode==75) tz-=1;
      if(e.keyCode==74) tx+=1;
      if(e.keyCode==76) tx-=1;

       if(e.keyCode==70){
        keyScheme = 1;
        alert("schemat sterowania A")
       } 
      }

 
 //alert(e.keyCode);
 //alert(angleX);
}