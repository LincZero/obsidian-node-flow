## Develop your own plugins with Vue3


## Init steps

1. Clone this repository to your `.obsidian\plugins` directory, and move into it.

2. Run `npm install` to install all the stuff you need, Including: 
   + vue3 sfc support
   + vue3 tsx support
   + typescript
   + esbuild

3. Run `npm run dev` to compile code and generate a `main.js`, which is the final output. Your `main.js` will be updated simultaneously with the change of your source code files.

If above steps work, you can turn on 'Vue Template' plugin in Obsidian. Click the *dice* like button on the left ribbon, a new tab will open on the right and says *"Hello,Developer!"*.

4. When you get ready to build a release, run `npm run build` to create it. This will remove all codemaps and minify code size.



## Notice

+ [hot-reload](https://forum.obsidian.md/t/plugin-release-for-developers-hot-reload-the-plugin-s-youre-developing/12185) plugin may be very helpful in your developing. It reloads the plugin whose `main.js` file changes, so you don't need do it yourself every time you make changes to code.