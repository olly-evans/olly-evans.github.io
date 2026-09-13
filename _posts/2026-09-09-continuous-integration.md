---
title: Using CI/CD pipelines in my Pathfinding Project
date: 2026-09-09 16:05:00
categories: [programming, testing, projects, ci/cd, github actions]
tags: [c, ci/cd, github actions] # Tag names always lowercase.
permalink: /continuous-integration/
---
# What is a CI/CD pipeline?

Continuous Integration and Continuous Deployment (CI/CD) pipelines are a practice focused on improving software delivery throughout the software development life cycle via automation.

By automating CI/CD throughout development, testing, production, and monitoring phases of the software development lifecycle, teams are able to develop higher quality code, faster and more securely.

# What is Continuous Integration (CI)?

Continuous Integration is a DevOps development practise that involves committing code in small quantities at a high frequency, after which automated builds and tests are ran.

This allows early identification of bugs, improvement of the quality of software and it also reduces the time to validate and release new updates.

# Using CI in my Pathfinding Project

Using Github Actions, it is very easy to automate workflows with great CI/CD.

Using Github-hosted runners we can run workflows outlined in a `.github/workflows/workflow.yml`. These runners are hosted on virtual machines containing an environment of tools, packages and settings for Github Actions to use.

I began with a template CMake workflow to work on multiple platforms and tweaked it for my needs, I chose to target Ubuntu with Clang and gcc as well as windows with MinGW. In the future I may look to support more compilers on windows.

## Matrix Strategy

```yaml
matrix:
        os: [ubuntu-latest, windows-latest]
        build_type: [Release]
        c_compiler: [gcc, clang, mingw]
        include:
          - os: windows-latest
            c_compiler: mingw
          - os: ubuntu-latest
            c_compiler: gcc
          - os: ubuntu-latest
            c_compiler: clang

```

The matrix strategy available in Github Actions was particularly useful for this, the matrix generates a Cartesian product of all possible combinations of the defined variables for all OS, compilers and versions. These jobs are run concurrently. We can also exclude certain options from the matrix which we know will be pointless, Windows and gcc for example.

## Steps

These are the steps for the workflow as of right now, every workflow must have a series of steps in order to finish a job.

```yaml
    steps:
    - uses: actions/checkout@v4
```
`actions/checkout@v4` is a Github Action that clones our repository on the newly established runner.

The next step is to then use the setup mingw Github Action if the matrixes c_compiler is mingw. This means we save some compute if we don't require mingw for the step.

```yaml
    - name: Set up MinGW
      if: matrix.c_compiler == 'mingw'
      uses: egor-tensin/setup-mingw@v3
      with:
        platform: x64
```

Setting reusable strings avoids hardcoding the same path string in multiple places. If I ever need to change the build directory location, you only change it once, in this step.

This is a very common pattern in workflows that build C/C++ projects with CMake, since CMake needs a build directory path passed to multiple commands.

```yaml
    - name: Set reusable strings
      id: strings
      shell: bash
      run: |
        echo "build-output-dir=${{ github.workspace }}/build" >> "$GITHUB_OUTPUT"
```

`GITHUB_OUTPUT` is a special environment variable pointing to a temporary file that GitHub Actions uses to capture step outputs.

```yaml
    - name: Configure CMake
      run: >
        cmake -B ${{ steps.strings.outputs.build-output-dir }}
        -DCMAKE_C_COMPILER=${{ matrix.c_compiler == 'mingw' && 'gcc' || matrix.c_compiler }}
        -DCMAKE_BUILD_TYPE=${{ matrix.build_type }}
        -G "Unix Makefiles"
        -S ${{ github.workspace }}
```

Here we configure CMake with a one-line command, -B is where we're putting our build files (/build/ variable in the reusable string step) - the C compiler to be used, the build type and the build-file generator to use. -S points to the source directory.

Then we can compile the project on the runner.

```yaml
    - name: Build
      run: cmake --build ${{ steps.strings.outputs.build-output-dir }} --config ${{ matrix.build_type }}
```

In our `/build/` directory.

```yaml
    - name: Test
      working-directory: ${{ steps.strings.outputs.build-output-dir }}
      run: ctest --build-config ${{ matrix.build_type }}
```

Before running our tests automatically from the build directory.

This gives me a great and fast idea as to how my pushes affect the existing codebase and specifically for different operating systems so bugs can be identified and addressed quickly.

Thanks for reading!