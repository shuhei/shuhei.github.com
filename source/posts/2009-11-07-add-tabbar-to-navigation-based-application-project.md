---
title: "Navigation-based Application に TabBar を追加"
tags: []
---

iPhone プロジェクトの新規作成時に &#8220;Navigation-based Application&#8221; を選んだ場合に、後から TabBar を追加する方法です。
InterfaceBuilder での設定が画像入りの説明なしではよくわからず、苦戦したのでメモしておきます。

## InterfaceBuilder の設定

### Tab Bar Controller の追加

まず、InterfaceBuilder で MainWindow.xib を開きます。
Navigation Controller を削除して Tab Bar Controller を追加します。

### Tab Bar Controller の下に Navigation Controller を

Tab Bar Controller にフォーカスをあて、Inspector の一番左のタブ の &#8220;Tab Bar Controller&#8221; =&gt; &#8220;View Controllers&#8221; の中で Navigation Controller にするタブの Class を Navigation Controller に変更します。

![](/images/2009/11/TabBarController_Inspector1.png)

すると、IB のメインウィンドウの方の Tab Bar Controller の子供の Controller の Type が UIViewController から UINavigationController に変わっているはずです。

### Navigation Controller の下に Root View Controller を

この Navigation Controller のさらに子供の View Controller が、もともとの Root View Controller になるよう設定します。
一番左側のタブで NIB Name を、Inspector で一番右側のタブで Class を設定します。

![](/images/2009/11/SetRootViewControllerNIB1.png)![](/images/2009/11/SetRootViewControllerClass1.png)

以上を保存して IB を閉じます。

## コードの修正

Xcode に戻って AppDelegate を変更し、UINavigationController ではなく UITabBarController を読み込むようにします。
以下、アプリケーションの名前を Hoge だったとして、 HogeAppDelegate.h と .m を編集します。

### HogeDelegate.h

```objc
@interface HogeAppDelegate : NSObject  {
  UIWindow *window;
  UITabBarController *tabBarController;
}

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet UITabBarController *tabBarController;

@end
```

### HogeAppDelegate.m

```objc
- (void)applicationDidFinishLaunching:(UIApplication *)application {
  [window addSubview:[tabBarController view]];
  [window makeKeyAndVisible];
}
```

`synsthesize` と `dealloc` 中の `release` も忘れずに変更します。

## App Delegate の Outlet のつなぎ変え

これまで App Delegate で UINavigationController を参照していたのを UITabBarController に変えたので、Outlet の設定が切れています。
再度 Interface Builder に戻って App Delegate の Outlet をつなぎ直します。

これで、Tab Bar Controller の下に Navigation Controller と View Controller、Navigation Controller の下に Root View Controller という構成になっているはずです。
