---
title: "CString と TCHAR* の連結"
tags: []
---

```cpp
CString cstr = foo();
TCHAR *tchar = bar();

CString concat = cstr + " " + tchar;
```

普通に足せば足せるようです。`*tchar` を足すと `tchar` の最初の一文字だけ連結されます。
