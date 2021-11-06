(async function () {
  try {
    const fs = require("fs/promises");
    const {existsSync} = require("fs");
    const {join} = require("path");

    const CI_DIR = join(__dirname, ".dist");

    if (!existsSync(CI_DIR)) {
      console.log("No .dist found. Attempting to run outside of CI context?");
      process.exit(1);
    }

    const plugins_large = {};
    const plugins = [];

    const files = await fs.readdir(CI_DIR);
    for (const file of files) {
      const isFolder = await fs
        .stat(join(CI_DIR, file))
        .then((x) => x.isDirectory());
      if (isFolder) {
        plugins.push(file);
        plugins_large[file] = require(join(CI_DIR, file, "plugin.json"));
      }
    }

    await fs.writeFile(join(CI_DIR, "plugins.json"), JSON.stringify(plugins));
    await fs.writeFile(
      join(CI_DIR, "plugins-large.json"),
      JSON.stringify(plugins_large)
    );

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
