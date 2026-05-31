#include "TFTFGraph/Helpers/helpers.h"
#include "TFTFGraph/TFTFGraph.h"
#include "json.hpp"
#include <cmath>
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

int main()
{
    graph = loadGraphFromDisk("data/graph.json");
    std::string line;

    while (std::getline(std::cin, line))
    {
        try
        {
            json request = json::parse(line);
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
