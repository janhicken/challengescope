"use strict";

function Player(name, points) {
    this.name = name;
    this.points = points;
}

function ChallengeGraph(containerSelector) {
    var players = {};
    var selectedNode = null;
    var container = document.querySelector(containerSelector);
    var d3Container = d3.select(container);
    var render = new dagreD3.render();
    var graph = new dagreD3.graphlib.Graph()
        .setGraph({
            transition: function (selection) {
                return selection.transition().duration(500);
            }
        })
        .setDefaultEdgeLabel(function () {
            return {};
        })
        .setDefaultNodeLabel(function (id) {
            return {label: createPlayerLabel(id), class: "btn btn-default"};
        });

    this.onselect = function () {};
    this.onclearselect = function () {};

    this.addPlayer = function (player) {
        players[player.name] = player;
        graph.setNode(player.name);
        refresh();
    };

    this.setSelectedPlayerPoints = function (points) {
        players[selectedNode].points = points;
        graph.node(selectedNode).label = createPlayerLabel(selectedNode);
        refresh();
    };

    this.clearSelection = function () {
        graph.node(selectedNode).class = graph.node(selectedNode).class.replace("active", "").trim();
        selectedNode = null;
        refresh();
        this.onclearselect();
    }.bind(this);

    var createPlayerLabel = function (playerName) {
        return playerName + " (" + players[playerName].points + ")"
    };

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

    var refresh = function () {
        render(d3Container, graph);
        d3Container.selectAll(".node")
            .on("click", handleNodeClick)
            .select("rect")
            .attr("rx", "4px")
            .attr("ry", "4px");

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
            challengeGraph.addPlayer(new Player(nameForm.name.value, parseInt(nameForm.points.value)));
            nameForm.reset();
        });

        var pointsForm = document.getElementById("pointsForm");
        var pointsDiv = document.getElementById("pointsDiv");
        pointsForm.addEventListener("submit", function (e) {
            e.preventDefault();
            challengeGraph.setSelectedPlayerPoints(parseInt(pointsForm.points.value));
            challengeGraph.clearSelection();
            pointsForm.points.focus();
        });
        pointsForm["x2"].addEventListener("click", function () {
            var previous = parseInt(pointsForm.points.value);
            pointsForm.points.value = previous * 2;
            challengeGraph.setSelectedPlayerPoints(parseInt(pointsForm.points.value));
        });
        pointsForm["=0"].addEventListener("click", function () {
            pointsForm.points.value = 0;
            challengeGraph.setSelectedPlayerPoints(parseInt(pointsForm.points.value));
        });

        var selectedPlayerP = document.getElementById("selectedPlayer");
        challengeGraph.onselect = function (player) {
            selectedPlayerP.textContent = player.name;
            pointsForm.points.value = player.points;
            pointsDiv.style.display = "block";
        };

        challengeGraph.onclearselect = function () {
            console.log("onclearselect");
            pointsForm.reset();
            pointsDiv.style.display = "none";
        };

        document.addEventListener("keydown", function (e) {
            if (e.keyCode === 27) {
                challengeGraph.clearSelection();
            }
        });
    });
})();
