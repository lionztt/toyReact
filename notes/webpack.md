# webpack
webpack是前端的js打包工具
输入输出都是js文件

重点作用：把js中的import和require的多文件变成一个单个的大文件

loader：使用各种loader定制各种文件
webpack原生支持js的打包文件，如果要将css或者html等打包成js文件，需要相应的loader


## webpack配置
由于无法对webpack配置文件本身做babel转换，所以使用node的方式引入文件

