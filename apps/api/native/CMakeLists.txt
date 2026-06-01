cmake_minimum_required(VERSION 3.16)

project(TFTFNativeRunner LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(tftf_runner
    src/tftf_runner.cpp
    src/TFTFGraph/TFTFGraph.cpp
    src/TFTFGraph/Helpers/helpers.cpp
)

add_executable(tftf_graph_builder
    src/tftf_graph_builder.cpp
    src/TFTFGraph/TFTFGraph.cpp
    src/TFTFGraph/Helpers/helpers.cpp
)

set_target_properties(tftf_runner PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_DEBUG "${CMAKE_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_RELEASE "${CMAKE_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_RELWITHDEBINFO "${CMAKE_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_MINSIZEREL "${CMAKE_SOURCE_DIR}/bin"
)

set_target_properties(tftf_graph_builder PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_DEBUG "${CMAKE_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_RELEASE "${CMAKE_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_RELWITHDEBINFO "${CMAKE_SOURCE_DIR}/bin"
    RUNTIME_OUTPUT_DIRECTORY_MINSIZEREL "${CMAKE_SOURCE_DIR}/bin"
)

if(MSVC)
    target_compile_options(tftf_runner PRIVATE /W4)
    target_compile_options(tftf_graph_builder PRIVATE /W4)
else()
    target_compile_options(tftf_runner PRIVATE -Wall -Wextra)
    target_compile_options(tftf_graph_builder PRIVATE -Wall -Wextra)
endif()
