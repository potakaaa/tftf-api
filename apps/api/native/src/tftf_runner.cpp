#include "TFTFGraph/Helpers/helpers.h"
#include "TFTFGraph/TFTFGraph.h"
#include "json.hpp"
#include <cmath>
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>

using json = nlohmann::json;

TFTFGraph graph;

json serializeCoordinates(const std::vector<Coordinate> &coordinates)
{
    json output = json::array();
    for (const auto &coordinate : coordinates)
    {
        output.push_back({
            {"lat", coordinate.latitude},
            {"lon", coordinate.longitude}});
    }
    return output;
}

std::string resolveGraphPath(const json &request)
{
    if (request.contains("graph_path") && request["graph_path"].is_string())
    {
        return request["graph_path"].get<std::string>();
    }

    if (const char *graphPath = std::getenv("TFTF_GRAPH_PATH"))
    {
        if (*graphPath != '\0')
        {
            return std::string(graphPath);
        }
    }

    return "data/graph.json";
}

int main()
{
    std::string line;
    std::string loadedGraphPath;

    while (std::getline(std::cin, line))
    {
        try
        {
            json request = json::parse(line);
            if (request.contains("graph_data"))
            {
                graph = loadGraphFromJson(request["graph_data"]);
                loadedGraphPath = "IN_MEMORY";
            }
            else
            {
                std::string graphPath = resolveGraphPath(request);
                if (graph.getRoutes().empty() || (graphPath != loadedGraphPath && graphPath != "IN_MEMORY"))
                {
                    graph = loadGraphFromDisk(graphPath);
                    loadedGraphPath = graphPath;
                }
            }

            Coordinate start = {request["start"]["lat"], request["start"]["lon"]};
            Coordinate end = {request["end"]["lat"], request["end"]["lon"]};
            std::vector<TFTFEdge> path = graph.calculateRouteFromCoordinates(start, end);

            if (path.empty())
            {
                std::cerr << "{\"error\":\"No valid path found\"}" << std::endl;
                continue;
            }

            std::vector<RoutePathInstruction> instructions = graph.constructRoutePathInstructions(path);
            json response = {
                {"total_fare", std::ceil(graph.calculateFareFromInstructions(instructions))},
                {"tftf", {
                    {"found", true},
                    {"route_count", instructions.size()},
                    {"route_segments", json::array()}
                }}};

            for (const auto &instruction : instructions)
            {
                response["tftf"]["route_segments"].push_back({
                    {"route_id", instruction.routeId},
                    {"route_name", instruction.routeName},
                    {"point_count", instruction.path.size()},
                    {"coordinates", serializeCoordinates(instruction.path)}
                });
            }

            std::cout << response.dump() << std::endl;
            std::cout.flush();
        }
        catch (const std::exception &error)
        {
            std::cerr << "{\"error\":\"" << error.what() << "\"}" << std::endl;
        }
    }

    return 0;
}
