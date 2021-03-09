module.exports = {
  frontend: {
    pages: {
      home: {
        title: "Welcome to Armagan's NBT APP!",
        description: "Here you can convert images to pixel arts, schematics to nbts. If you need help about something about this app or just want to talk with people you can always join to our discord server..",
        discordButton: "Join to Discord"
      },
      pixelart: {
        title: "Pixel Art Generator",
        description: "Here you can convert images to pixel arts. Input is the any type of image. Output is blank txt file.",
        input: {
          text: "Input",
          noFile: "Please pick a image."
        },
        output: {
          text: "Output",
          noFile: "Please pick a txt file."
        },
        feedback: {
          imageSize: "Image size: {W}x{H}",
          requiredBlocksToBuild: "Required blocks to build: {A}"
        },
        dithering: {
          auto: "Auto",
          disabled: "No dithering",
          amounts: "Dither every {x} pixel",
          tooltip: "Makes image look much better from distance!"
        },
        scaleFactor: "Scale Factor",
        buildFromCenter: "Build from the center."
      }
    }
  }
}