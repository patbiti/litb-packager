src=$1;tags=$2;now=`date +%Y%m%d%H%M`;tagName=lightsource_${tags}_$now;tag=$3;
echo 'PI packager sh: git from branch' $src 'to tag:'$tagName
#1.进入到工作目录
cd /home/wenhuajian/code/ria.lightsource
#2.代码更新操作。
git pull
#2.1 切换分支
git checkout $src
#2.2 更新分支
git pull
#2.3 git status 输出到日志文件里。
git status >> /data/ria/git.tags/$tagName-log.txt
#3.生成目标目录
mkdir /data/ria/git.tags/$tagName
cd ..
#4.执行打包程序
#4.1 ria-packager
#4.2 ria-packager的输出日志输出到日志文件里。
ria-packager -from ria.lightsource -to /data/ria/git.tags/$tagName -v >> /data/ria/git.tags/$tagName-log.txt
cd /data/ria/git.tags/$tagName
logDir=/data/ria/git.tags/$tagName-log.txt
str_Time="Package-Time"
packagertime=$(tail ${logDir}  -n 1)
#根据日志文件中的packager-time判断ria-packager 是否根据打包成功，决定继续进行修改。
if [[ "${packagertime/$str_Time/}" != "$packagertime" ]]
	then
	echo packagertime
	else
	echo 'failed'
	rm /data/ria/git.tags/$tagName -rf
	exit 2
fi
#5.执行图片压缩脚本。
#5.1 图片压缩信息输出到日志文件里。
node /home/wenhuajian/code/ria-packager/lib/tools/compressImg.js /data/ria/git.tags/$tagName/img/ >> /data/ria/git.tags/$tagName-log.txt
#6 输出日志文件到tags里。
echo $tags > tags.txt
cd ..
#7 打包文件
#7.1打包压缩包。
tar cfvz $tagName.tgz $tagName
#7.2 输出到指定目录
cp $tagName.tgz ../tags/
#7.3 【仅上线包使用】版本记录管理
if [ -z "$tag" ]
	then
	#7.3 【仅上线包使用】版本记录管理
	#7.3.1 将最新包替换成本次打包的文件。
	rm online-packager.tgz
	cp $tagName.tgz online-packager
	#7.3.2 git tag本次打包的内容。
	git tag online-$tags
	#7.3.3 git tag 本次打包的注释内容。
	echo 'time:' $now ' src:' $src ' tags:' $tag >> online.txt
	echo $tagName
else
	echo $tagName
fi




