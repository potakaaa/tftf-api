import json
import requests

with open('/home/hd/projects/TFTFGraph/data/geojson/allRoutes.geojson', 'r') as f:
    geojson_data = json.load(f)

payload = {
    "geojson_data": geojson_data
}

response = requests.post("http://localhost:8000/api/graphs/rebuild", json=payload, stream=True)
for line in response.iter_lines():
    if line:
        line_str = line.decode('utf-8')
        if '"type":"progress"' in line_str:
            pass # print("Progress event received")
        elif '"type":"completed"' in line_str:
            print("Completed event received!")
            event = json.loads(line_str)
            print("Route count:", event.get("route_count"))
            print("Edge count:", event.get("edge_count"))
            if "graph_data" in event:
                print("Graph data keys:", event["graph_data"].keys())
                print("Graph data string size:", len(json.dumps(event["graph_data"])))
