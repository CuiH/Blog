deploy:
	rm -r ~/tmp/_site
	git checkout master
	jekyll build
	git add --all
	git commit -m "update source"
	cp -r _site/ ~/tmp/
	git checkout gh-pages
	rm -r ./*
	cp -r /tmp/_site/* ./
	git add --all
	git commit -m "deploy blog"
	git push origin gh-pages
	git checkout master
	git push origin master