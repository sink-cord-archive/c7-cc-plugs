#1/bin/sh

mkdir .dist
cp index.html .dist
cp index.html .dist/404.html
echo $PWD
for plugin in */; do
  echo "$plugin"
  cd "$plugin"
  sperm build -o "../.dist/$plugin"
  cd ..
done

#node repoGen.js
mv .dist public

