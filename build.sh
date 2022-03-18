#1/bin/sh

mkdir .dist
cp index.html .dist
cp index.html .dist/404.html
for plugin in */; do
  echo "$plugin"
  cd $plugin
  echo $PWD
  sperm build -o "../.dist/$plugin"
  cd ..
done

#node repoGen.js
mv .dist public

