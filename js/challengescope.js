"use strict";

function Player(name, points, hasCrown) {
    this.name = name;
    this.points = points;
    this.hasCrown = hasCrown;
}

function ChallengeGraph(containerSelector) {
    var players = {};
    var selectedNode = null;
    var container = document.querySelector(containerSelector);
    var d3Container = d3.select(container);
    var render = new dagreD3.render();

    var createPlayerLabel = function (playerName) {
        var player = players[playerName];
        var label = {
            label: playerName + " (" + player.points + ")",
            class: "btn btn-default"
        };
        if (player.hasCrown) {
            label.class += " crown"
        }

        return label;
    };

    var graph = new dagreD3.graphlib.Graph()
        .setGraph({
            transition: function (selection) {
                return selection.transition().duration(500);
            }
        })
        .setDefaultEdgeLabel(function () {
            return {};
        })
        .setDefaultNodeLabel(createPlayerLabel);

    this.onselect = function () {
    };
    this.onclearselect = function () {
    };

    this.addPlayer = function (player) {
        players[player.name] = player;
        graph.setNode(player.name);
        refresh();
    };

    this.editPlayer = function (points, hasCrown) {
        players[selectedNode].points = points;
        players[selectedNode].hasCrown = hasCrown;
        var playerLabel = createPlayerLabel(selectedNode);
        var wasActive = graph.node(selectedNode).class.includes("active");

        graph.node(selectedNode).label = playerLabel.label;
        graph.node(selectedNode).class = playerLabel.class;
        if (wasActive) graph.node(selectedNode).class += " active";
        refresh();
    };

    this.clearSelection = function () {
        graph.node(selectedNode).class = graph.node(selectedNode).class.replace("active", "").trim();
        selectedNode = null;
        refresh();
        this.onclearselect();
    }.bind(this);

    var selectPlayer = function (playerName) {
        selectedNode = playerName;
        graph.node(playerName).class += " active";
        refresh();
        this.onselect(players[playerName]);
    }.bind(this);

    var handleNodeClick = function (id) {
        if (selectedNode === null) {
            selectPlayer(id)
        } else if (selectedNode === id) {
            this.clearSelection();
        } else {
            graph.setEdge(selectedNode, id);
            if (!dagreD3.graphlib.alg.isAcyclic(graph)) {
                graph.removeEdge(selectedNode, id);
                alert("This would create a cycle!");
            }
            this.clearSelection();
        }
    }.bind(this);

    var handleNodeMiddleClick = function (id) {
        graph.removeNode(id);
        refresh();
    };

    var handleNodeMouseDown = function (id) {
        if (d3.event.button === 0)
            handleNodeClick(id);
        else if (d3.event.button === 1)
            handleNodeMiddleClick(id)
    };

    var handleEdgeMiddleClick = function (edge) {
        graph.removeEdge(edge.v, edge.w);
        refresh();
    };

    var handleEdgeMouseDown = function (edge) {
        if (d3.event.button === 1) {
            handleEdgeMiddleClick(edge);
        }
    };

    var refresh = function () {
        render(d3Container, graph);
        d3Container.selectAll(".node")
            .on("mousedown", handleNodeMouseDown)
            .select("rect")
            .attr("rx", "4px")
            .attr("ry", "4px");

        d3Container.selectAll(".edgePath")
            .on("mousedown", handleEdgeMouseDown);

        d3Container.selectAll(".node.crown").each(function () {
            var size = 20;
            var g = d3.select(this);
            var rect = g.select("rect");
            g.insert("image")
                .attr("href", "img/crown.png")
                .attr("x", -size / 2)
                .attr("y", rect.attr("y") - rect.attr("height") / 2)
                .attr("width", size)
                .attr("height", size);
        });

        container.setAttribute("height", graph.graph().height + 40);
        var xOffset = (container.width.baseVal.value - graph.graph().width) / 2;
        container.querySelector("g").setAttribute("transform", "translate(" + xOffset + ", 20)")
    };
}


(function () {
    document.addEventListener("DOMContentLoaded", function () {
        var challengeGraph = new ChallengeGraph("#graph");

        var nameForm = document.getElementById("nameForm");
        nameForm.addEventListener("submit", function (e) {
            e.preventDefault();
            var newPlayer = new Player(
                nameForm.name.value,
                parseInt(nameForm.points.value),
                false);

            challengeGraph.addPlayer(newPlayer);
            nameForm.reset();
        });

        var pointsForm = document.getElementById("pointsForm");
        var pointsDiv = document.getElementById("pointsDiv");
        pointsForm.addEventListener("submit", function (e) {
            e.preventDefault();
            challengeGraph.editPlayer(
                parseInt(pointsForm.points.value),
                pointsForm.crown.classList.contains("active"));
            challengeGraph.clearSelection();
            pointsForm.points.focus();
        });
        pointsForm["x2"].addEventListener("click", function () {
            var previous = parseInt(pointsForm.points.value);
            pointsForm.points.value = previous * 2;
            challengeGraph.editPlayer(
                parseInt(pointsForm.points.value),
                pointsForm.crown.classList.contains("active"));
        });
        pointsForm["=0"].addEventListener("click", function () {
            pointsForm.points.value = 0;
            challengeGraph.editPlayer(
                parseInt(pointsForm.points.value),
                pointsForm.crown.classList.contains("active"));
            challengeGraph.clearSelection();
        });
        pointsForm.crown.addEventListener("click", function () {
            this.classList.toggle("active");
            challengeGraph.editPlayer(
                parseInt(pointsForm.points.value),
                pointsForm.crown.classList.contains("active"));
            challengeGraph.clearSelection();
        });

        var selectedPlayerP = document.getElementById("selectedPlayer");
        challengeGraph.onselect = function (player) {
            selectedPlayerP.textContent = player.name;
            pointsForm.points.value = player.points;
            pointsDiv.style.display = "block";
            if (player.hasCrown) pointsForm.crown.classList.add("active");
        };

        challengeGraph.onclearselect = function () {
            pointsForm.reset();
            pointsDiv.style.display = "none";
            pointsForm.crown.classList.remove("active");
        };

        document.addEventListener("keydown", function (e) {
            if (e.keyCode === 27) {
                challengeGraph.clearSelection();
            }
        });
    });
})();
