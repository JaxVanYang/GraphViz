# GraphViz

![Cube](images/cube.gif)

Web implementation for Stanford CS106L assignment 1 -- GraphViz.

Try to visualize the graph with a pleasing layout.

[Live Demo](https://jaxvanyang.github.io/GraphViz)

## Input Format

The first line is the count of nodes in the graph.

The following lines are the edges in the graph. Each edge is represented by two integers, the source and destination node. The nodes are 0-indexed.

For example (triangle):

```text
3
0 1
0 2
1 2
```

Output:

![triangle](images/triangle.png)

You can check out the [api/graphs/](api/graphs/) folder for more examples.

## Development

Place your example graphs under [api/graphs/](api/graphs/) and then run `sh/generate.sh` to generate [api/graphs.json](api/graphs.json). This file is used by the frontend to get the list of graphs.