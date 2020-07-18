function genG6Data(objs) {
    return objs.forEach(obj => {
        console.log(`            {
                id: '${obj}',
                label: '${obj}'
            },`)
    });
}

// genG6Data(["Object", "Function", "Boolean", "Symbol"]);
genG6Data(
    [
        "WebAssembly",
"WebAssembly.Module",
"WebAssembly.Instance",
"WebAssembly.Memory",
"WebAssembly.Table",
"WebAssembly.CompileError",
"WebAssembly.LinkError",
"WebAssembly.RuntimeError"
    ] 
);

