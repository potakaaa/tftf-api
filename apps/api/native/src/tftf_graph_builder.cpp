#include "TFTFGraph/Helpers/helpers.h"
#include "TFTFGraph/TFTFGraph.h"
#include "json.hpp"
#include <fstream>
#include <iostream>
#include <string>

using json = nlohmann::json;

namespace
{
size_t countEdges(TFTFGraph &graph)
{
    size_t edgeCount = 0;
    for (const auto &[routeId, route] : graph.getRoutes())
    {
        edgeCount += route.edges.size();
    }
    return edgeCount;
}

void writeEvent(const json &event)
{
    std::cout << event.dump() << std::endl;
    std::cout.flush();
}
} // namespace

int main()
{
    std::string line;
    if (!std::getline(std::cin, line))
    {
        writeEvent({{"type", "error"}, {"message", "Missing graph build request"}});
        return 1;
    }

    try
    {
        json request = json::parse(line);
        std::string sourceGraphPath = request.value("graph_path", std::string("data/graph.json"));
        std::string outputGraphPath = request.value("output_path", std::string(""));
        float transferRange = request.value("transfer_range", 300.0f);

        TFTFGraph graph;
        if (request.contains("geojson_data"))
        {
            graph = loadGraphFromGeoJSONObj(request["geojson_data"]);
        }
        else if (sourceGraphPath.size() >= 8 && sourceGraphPath.substr(sourceGraphPath.size() - 8) == ".geojson")
        {
            graph = loadGraphFromGeoJSON(sourceGraphPath);
        }
        else
        {
            graph = loadGraphFromDisk(sourceGraphPath);
        }
        graph.clearTransfers();

        graph.createTransfersFromCoordinates(
            transferRange,
            [&](const ProgressUpdate &update)
            {
                writeEvent({
                    {"type", "progress"},
                    {"stage", update.stage},
                    {"completed", update.completed},
                    {"total", update.total},
                    {"message", update.message},
                });
            });

        if (!outputGraphPath.empty())
        {
            saveGraphToDisk(graph, outputGraphPath);
            writeEvent({
                {"type", "completed"},
                {"graph_path", outputGraphPath},
                {"route_count", graph.getRoutes().size()},
                {"edge_count", countEdges(graph)},
            });
        }
        else
        {
            writeEvent({
                {"type", "completed"},
                {"route_count", graph.getRoutes().size()},
                {"edge_count", countEdges(graph)},
                {"graph_data", graph.toJson()},
            });
        }
        return 0;
    }
    catch (const std::exception &error)
    {
        writeEvent({{"type", "error"}, {"message", error.what()}});
        return 1;
    }
}
