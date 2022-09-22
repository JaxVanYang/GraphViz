class Node {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Edge {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

class SimpleGraph {
  constructor() {
    this.nodes = [];
    this.edges = [];
  }
}

class Force {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
}


const kRepel = 0.001;
const kAttract = 0.001;
let graph;


// Use default graph
function initInput(textGraph, numberTime) {
  const lines = [
    '31',
    '0 1',
    '0 2',
    '1 3',
    '1 4',
    '2 5',
    '2 6',
    '3 7',
    '3 8',
    '4 9',
    '4 10',
    '5 11',
    '5 12',
    '6 13',
    '6 14',
    '7 15',
    '7 16',
    '8 17',
    '8 18',
    '9 19',
    '9 20',
    '10 21',
    '10 22',
    '11 23',
    '11 24',
    '12 25',
    '12 26',
    '13 27',
    '13 28',
    '14 29',
    '14 30',
  ];
  textGraph.value = lines.join('\n');

  numberTime.value = '100';
}

function getGraph(textGraph) {
  const lines = textGraph.value.split('\n');
  const graph = new SimpleGraph();

  const nodeCnt = parseInt(lines[0]);
  for (let i = 0; i < nodeCnt; ++i) {
    graph.nodes.push(new Node());
  }

  // TODO: input check
  for (let i = 1; i < lines.length; ++i) {
    const vals = lines[i].split(' ');
    if (vals.length !== 2) {
      // TODO: use error handling
      // return graph;
      console.log(`Invalid line[${i + 1}]: ${lines[i]}`);
      continue;
    }

    const start = parseInt(vals[0]);
    const end = parseInt(vals[1]);
    graph.edges.push(new Edge(start, end));
  }
  return graph;
}

// Move canvas origin to the center of canvas
function initGraphCtx(ctx) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.translate(width / 2, height / 2);
  ctx.scale(1, -1);
  ctx.lineWidth = 0.03;
  ctx.fillStyle = 'rgb(70, 185, 227)';
}

function initGraph() {
  const n = graph.nodes.length;
  for (let i = 0; i < n; ++i) {
    const theta = 2 * Math.PI * i / n;
    graph.nodes[i].x = Math.cos(theta);
    graph.nodes[i].y = Math.sin(theta);
  }
}

function drawNode(node, ctx) {
  ctx.beginPath();
  ctx.arc(node.x, node.y, 0.1, 0, 2 * Math.PI);
  ctx.fill();
}

function drawLine(start, end, ctx) {
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

function resetCanvas(ctx) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(-width / 2, -height / 2, width, height);
}

function drawGraph(ctx) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  let deltaX = 0, deltaY = 0;

  // save current transformation matrix for resetCanvas()
  ctx.save();

  for (const node of graph.nodes) {
    deltaX = Math.max(deltaX, Math.abs(node.x));
    deltaY = Math.max(deltaY, Math.abs(node.y));
  }

  // add node radius
  deltaX += 0.1;
  deltaY += 0.1;

  const scaleX = width / 2 / deltaX;
  const scaleY = height / 2 / deltaY;
  const scale = Math.min(scaleX, scaleY) * 0.9;
  ctx.scale(scale, scale);

  for (const edge of graph.edges) {
    const start = graph.nodes[edge.start];
    const end = graph.nodes[edge.end];
    drawLine(start, end, ctx);
  }

  for (const node of graph.nodes) {
    drawNode(node, ctx);
  }

  ctx.beginPath();
  ctx.stroke();

  ctx.restore();
}

// Calculate repulsive force between nodes
function calcRepel(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // repulsive force is inversely proportional to the distance
  return kRepel / dist;
}

// Calculate attractive force between edge
function calcAttract(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distSquare = dx * dx + dy * dy;

  // attractive force is proportional to the squre of distance
  return kAttract * distSquare;
}

// Calculate the angle between start -> end and x-axis
function calcAngle(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.atan2(dy, dx);
}

function updateGraph() {
  const nodes = graph.nodes;
  const edges = graph.edges;
  const n = nodes.length;
  const forces = [];
  for (let i = 0; i < n; ++i) {
    forces.push(new Force());
  }

  // calculate repulsive force between nodes
  for (let i = 0; i < n; ++i) {
    for (let j = i + 1; j < n; ++j) {
      const start = nodes[i];
      const end = nodes[j];
      const force = calcRepel(start, end);
      const theta = calcAngle(start, end);
      const fx = force * Math.cos(theta);
      const fy = force * Math.sin(theta);

      forces[i].x -= fx;
      forces[i].y -= fy;
      forces[j].x += fx;
      forces[j].y += fy;
    }
  }

  // calculate attractive force between edge's end nodes
  for (const edge of edges) {
    const start = nodes[edge.start];
    const end = nodes[edge.end];
    const force = calcAttract(start, end);
    const theta = calcAngle(start, end);
    const fx = force * Math.cos(theta);
    const fy = force * Math.sin(theta);

    forces[edge.start].x += fx;
    forces[edge.start].y += fy;
    forces[edge.end].x -= fx;
    forces[edge.end].y -= fy;
  }

  for (let i = 0; i < n; ++i) {
    nodes[i].x += forces[i].x;
    nodes[i].y += forces[i].y;
  }
}

async function initGraphExamples(divGraphExamples, textGraph) {
  const graphsApi = 'api/graphs.json';
  const graphsDir = 'api/graphs';

  const response = await fetch(graphsApi);
  const graphs = await response.json();

  divGraphExamples.innerHTML = '';
  for (const graph of graphs) {
    const div = document.createElement('div');
    div.className = 'graph-example';
    div.innerHTML = graph;
    div.onclick = async () => {
      const response = await fetch(`${graphsDir}/${graph}`);
      const text = await response.text();
      textGraph.value = text;
    };
    divGraphExamples.appendChild(div);
  }
}

function main() {
  const graphCanvas = document.getElementById('graph-canvas');
  const graphCtx = graphCanvas.getContext('2d');
  const textGraph = document.getElementById('text-graph');
  const numberTime = document.getElementById('number-time');
  const btnRun = document.getElementById('btn-run');
  const btnReset = document.getElementById('btn-reset');
  const divGraphExamples = document.querySelector('.graph-examples');

  initGraphCtx(graphCtx);
  initInput(textGraph, numberTime);
  initGraphExamples(divGraphExamples, textGraph);

  let start = null;
  let time = 3000;
  let animationId = null;

  function drawFrame(timestamp) {
    if (start === null) {
      start = timestamp;
    }

    resetCanvas(graphCtx);
    drawGraph(graphCtx);
    updateGraph();

    if (timestamp - start < time) {
      requestAnimationFrame(drawFrame);
    } else {
      start = null;
      animationId = null;
      btnRun.disabled = false;
    }
  }

  // FIXME: cannot stop animation
  function cancelAnimation() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      start = null;
      animationId = null;
      btnRun.disabled = false;
    }
  }

  function startAnimation() {
    // convert time to milliseconds
    time = parseInt(numberTime.value) * 1000;

    graph = getGraph(textGraph);
    initGraph(graph);

    cancelAnimation();
    animationId = requestAnimationFrame(drawFrame);
  }


  // Bind buttons
  btnRun.addEventListener('click', () => {
    // btnRun.disabled = true;
    startAnimation();
  });

  btnReset.addEventListener('click', () => {
    // FIXME: reset canvas
    cancelAnimation();
    resetCanvas(graphCtx);
    initInput(textGraph, numberTime);
  });

  // TODO: auto ajust canvas size
}

main();