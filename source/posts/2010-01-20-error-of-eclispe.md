---
title: "Eclipse の起動エラー"
tags: []
lang: ja
---

Eclipse IDE for Java EE Developers (based on Eclipse 3.5 SR1) をダウンロードしてから最初の起動時に &#8220;JVM Terminated.&#8221; 的なエラー。
eclipse.ini を修正。

```
-startup
plugins/org.eclipse.equinox.launcher_1.0.201.R35x_v20090715.jar
--launcher.library
plugins/org.eclipse.equinox.launcher.win32.win32.x86_1.0.200.v20090519
-product
org.eclipse.epp.package.jee.product
--launcher.XXMaxPermSize
256M
-showsplash
org.eclipse.platform
--launcher.XXMaxPermSize
256m
-vmargs
-Dosgi.requiredJavaVersion=1.5
-Xms40m
-Xmx512m
```

上を下に。

```
-startup
plugins/org.eclipse.equinox.launcher_1.0.201.R35x_v20090715.jar
--launcher.library
plugins/org.eclipse.equinox.launcher.win32.win32.x86_1.0.200.v20090519
-product
org.eclipse.epp.package.jee.product
--launcher.XXMaxPermSize
256M
-showsplash
org.eclipse.platform
--launcher.XXMaxPermSize
256m
-vm
C:\Program Files\Java\jdk1.6.0_18\bin\javaw.exe
-vmargs
-Dosgi.requiredJavaVersion=1.6
-Xms40m
-Xmx512m
```

via [Eclipse の起動エラー（JVM terminated. Exit code=-1） &#8211; がんばれ！aotan2008](http://aotan2008.eco.coocan.jp/blog/archives/2009/06/08133609.php)
