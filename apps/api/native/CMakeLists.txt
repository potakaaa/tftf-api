cmake_minimum_required(VERSION 3.16)

project(TFTFNativeRunner LANGUAGES CXX)

# Allow overriding the C++ standard via environment variable TFTF_CXX_STANDARD
# so developers can build with C++17 or C++20 depending on their toolchain.
if(DEFINED ENV{TFTF_CXX_STANDARD})
    set(CMAKE_CXX_STANDARD $ENV{TFTF_CXX_STANDARD})
else()
    # default to C++17 for maximum compatibility
    set(CMAKE_CXX_STANDARD 17)
endif()
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(tftf_runner
    src/tftf_runner.cpp
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

if(MSVC)
    # Add /std:c++20 only when C++20 (or newer) is requested — older toolchains
    # may not support this flag.
    if (CMAKE_CXX_STANDARD GREATER_EQUAL 20)
        target_compile_options(tftf_runner PRIVATE /W4 /std:c++20)
    else()
        target_compile_options(tftf_runner PRIVATE /W4)
    endif()
else()
    target_compile_options(tftf_runner PRIVATE -Wall -Wextra)
endif()
