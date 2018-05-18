rm -rf vueSPA
git clone https://github.com/itheima2017/vue-element-admin-itheima vueSPA
cd vueSPA
rm -rf .git
rm -rf package.json
mv -f _package.json package.json
cd ..

rm -rf javaSpringBoot2
git clone https://github.com/itheima2017/vue-element-admin-api-java-itheima javaSpringBoot2
cd javaSpringBoot2
rm -rf .git
rm -rf src/main/resources/application.yml
mv -f src/main/resources/_application.yml src/main/resources/application.yml
rm -rf db/init.sql
mv -f db/_init.sql db/init.sql
cd ..

git clone https://github.com/itheima2017/vue-element-admin-doc-itheima README
cd README
rm -rf .git
cd ..

git clone https://github.com/itheima2017/vue-element-admin-api-java-itheima API
cd API
rm -rf .git
cd ..
