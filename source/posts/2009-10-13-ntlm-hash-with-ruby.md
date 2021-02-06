---
title: "NTLM ハッシュ を求める"
tags: [Ruby]
lang: ja
---

最近の Windows のパスワードの暗号化に使われているそうです。元の文字列をリトルエンディアンの UTF-16 に符号化したものから [MD4](http://en.wikipedia.org/wiki/MD4) でハッシュを作成するのだとか。

## Ruby で

16 進数表現の文字列として出力します。もう少しうまい方法がある気がするのですが・・・。
NTLM ハッシュの計算そのものは [Ruby/NTLM](http://rubyforge.org/projects/rubyntlm/) に頼っています。ちなみに Ruby/NTLM をインストールするには、 `gem install rubyntlm` とします。

```rb
require 'rubygems'
require 'net/ntlm'

def ntlm_hash16(password)
  result = ""
  hash = Net::NTLM.ntlm_hash(password)
  hash.size.times do |i|
    result += sprintf("%02x", hash[i])
  end
  result
end

ntlm_hash16("p@ssw0rd") #=> "de26cce0356891a4a020e7c4957afc72"
```

### 追記

`sprintf("%02x", hash[i])` の部分を、最初は `hash[i].to_s(16)` と書いていました。しかし、これだと 15 以下の数が来たときに 0 が抜けてしまうので、修正しました。

## Python で

ついでに Python でも。

```py
import hashlib

def ntlm_hash16(password):
  result = ""
  digest = hashlib.new('md4', password.encode('utf-16le')).digest()
  for ch in digest:
    result += "%02x" % ord(ch)
  return result

ntlm_hash16("p@ssw0rd") #=> 'de26cce0356891a4a020e7c4957afc72'
```

Ruby でも Python でも、さすがに結果は同じようですね。

### 追記

Python でも Ruby と同じような間違いをしていました。
`"%02x" % ord(ch)` の部分を、最初は `hex(ord(ch))[2:]` と書いていました。
いやあ、テストは大事ですね。
