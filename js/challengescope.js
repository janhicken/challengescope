"use strict";

function Player(name) {
    this.name = name;
    this.points = 0;
}

function ChallengeGraph(containerSelector) {
    this.players = new Set();

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
            return {label: id, class: "btn btn-default"};
        });

    var selectedNode = null;
    var onSelect = function (id) {
        if (selectedNode === null) {
            selectedNode = id;
            graph.node(id).class += " active";
        } else if (selectedNode === id) {
            graph.node(selectedNode).class = graph.node(selectedNode).class.replace("active", "").trim();
            selectedNode = null;
        } else {
            graph.setEdge(selectedNode, id);
            graph.node(selectedNode).class = graph.node(selectedNode).class.replace("active", "").trim();
            if (!dagreD3.graphlib.alg.isAcyclic(graph)) {
                graph.removeEdge(selectedNode, id);
                alert("This would create a cycle!");
            }
            selectedNode = null;
        }
        refresh();
    };

    var refresh = function () {
        render(d3Container, graph);
        d3Container.selectAll(".node")
            .on("click", onSelect)
            .select("rect")
            .attr("rx", "4px")
            .attr("ry", "4px");

        container.setAttribute("height", graph.graph().height + 40);
        var xOffset = (container.width.baseVal.value - graph.graph().width) / 2;
        container.querySelector("g").setAttribute("transform", "translate(" + xOffset + ", 20)")
    };

    this.addPlayer = function (player) {
        graph.setNode(player.name);
        refresh();
    };
}

(function () {
    document.addEventListener("DOMContentLoaded", function () {
        var challgengeGraph = new ChallengeGraph("#graph");

        document.getElementById("nameForm").addEventListener("submit", function (e) {
            e.preventDefault();
            var input = document.getElementById("nameInput");
            var name = input.value;
            challgengeGraph.addPlayer(new Player(name));
            input.value = "";
        });

    });
})();
