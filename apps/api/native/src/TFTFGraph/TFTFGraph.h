#ifndef TFTFGRAPH_H
#define TFTFGRAPH_H

#include <string>
#include <vector>
#include <functional>
#include <unordered_map>
#include <limits>
#include "../json.hpp"

using json = nlohmann::json;


struct PairHash
{
    std::size_t operator()(const std::pair<int, int> &p) const noexcept
    {
        return std::hash<int>()(p.first) ^ (std::hash<int>()(p.second) << 1);
    }
};

struct Coordinate
{
    double latitude;
    double longitude;
};

bool operator==(const Coordinate &lhs, const Coordinate &rhs);

struct TransferZone{
    int routeId;
    Coordinate start;
    Coordinate end;
    Coordinate closestCoord;
};

struct TFTFEdge
{
    float transferCost;
    TransferZone transferZone1;
    TransferZone transferZone2;
};

struct RoutePathInstruction{
    int routeId;
    std::string routeName;
    std::vector<Coordinate> path;
};

struct ProgressUpdate
{
    std::string stage;
    size_t completed;
    size_t total;
    std::string message;
};

using ProgressCallback = std::function<void(const ProgressUpdate &)>;

struct RouteNode
{
    int routeId;
    std::string routeName;
    std::vector<TFTFEdge> edges;
    std::vector<Coordinate> path;
    bool isLoop = false; // indicates if the route is a loop
};

class TFTFGraph
{
public:
    void addRoute(int id, const std::string &name);
    void setRoutePath(int routeId, const std::vector<Coordinate> &coordinates);
    void clearTransfers();
    std::vector<RoutePathInstruction> constructRoutePathInstructions(const std::vector<TFTFEdge> &path) const;
    void createTransfersFromCoordinates(float transferRangeMeters, ProgressCallback progress = {});
    std::vector<int> getNearbyRoutes(const Coordinate &coord, float maxDistanceMeters);
    double calculateFareFromInstructions(const std::vector<RoutePathInstruction> &routeInstructions);
    std::vector<TFTFEdge> calculateRouteFromCoordinates(const Coordinate &startCoord, const Coordinate &endCoord);
    std::unordered_map<int, RouteNode> &getRoutes();
    void getGraphDetails() const;
    json toJson() const;
    double calculateTotalFare(const std::vector<TFTFEdge> &path, const Coordinate &startCoord, const Coordinate &endCoord);
    void addEdge(int routeId1, int routeId2, TransferZone route1, TransferZone route2, float transferCost);
    std::vector<const RouteNode *> extractTraversedRouteNodes(const std::vector<TFTFEdge> &path) const;
    std::vector<TFTFEdge> findMinFarePath(int startRouteId, int endRouteId,int projectedStartIdx);

private:
    std::unordered_map<int, RouteNode> routes;
};
TFTFGraph loadGraphFromDisk(const std::string& filename);
TFTFGraph loadGraphFromGeoJSON(const std::string& filename);
TFTFGraph loadGraphFromGeoJSONObj(const json& geojson);
TFTFGraph loadGraphFromJson(const json& j);
void saveGraphToDisk(const TFTFGraph& graph, const std::string& filename);
json generateRoutePathGeoJSON(
    const std::vector<RoutePathInstruction> &instructions,
    const Coordinate &startCoord,
    const Coordinate &endCoord);
#endif
