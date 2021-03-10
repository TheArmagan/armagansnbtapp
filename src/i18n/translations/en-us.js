module.exports = {
  meta: {
    code: "en-us",
    name: "English (US)",
    translator: "Kıraç Armağan Önal",
    version: 1
  },
  frontend: {
    pages: {
      home: {
        title: "Welcome to Armagan's NBT APP!",
        description: {
          text: "Here you can convert images to pixel arts, schematics to nbts. If you need help about something about this app or just want to talk with people you can always join to {link}.",
          linkText: "this discord server"
        }
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
          imageSize: "Image size: {width}x{height}",
          requiredBlocksToBuild: "Required blocks to build: {amount}"
        },
        dithering: {
          auto: "Auto",
          disabled: "No dithering",
          amounts: "Dither every {amount} pixel",
          tooltip: "Makes image look much better from distance!"
        },
        scaleFactor: "Scale Factor",
        buildFromCenter: "Build from the center."
      },
      settings: {
        title: "Settings",
        sections: {
          general: {
            title: "General",
            desktopNotifications: "Desktop Notifications"
          },
          pixelart: {
            title: "Pixel Art Generator",
            colorMap: {
              text: "Color Map",
              noFile: "Please pick a color map.",
              noFileInfo: {
                text: "Get default.colormap.json from {link}.",
                linkText: "here"
              }
            }
          },
          advanced: {
            title: "Advanced",
            appenderLimit: {
              text: "Appender Limit",
              description: "How often results will be written to the file. (Higher numbers cause more ram usage, but generators runs faster.)"
            }
          },
          buttons: {
            saveSettings: "Save Settings",
            resetSettings: "Reset Settings"
          }
        }
      }
    }
  }
}