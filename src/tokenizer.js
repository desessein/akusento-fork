function tokenize(phrase) {
  let rma = new RakutenMA(model_ja);
  rma.featset = RakutenMA.default_featset_ja;
  rma.hash_func = RakutenMA.create_hash_func(15);
  return rma.tokenize(HanZenKaku.hs2fs(HanZenKaku.hw2fw(HanZenKaku.h2z(phrase))));
}

function kuromojizer(word = "大きくなる") {
  console.log(isOn)
  // kuromoji
  //   .builder({dicPath: chrome.extension.getURL("./kuromoji/dict")})
  //   .build(function (err, tokenizer) {
  //     tokenizer = tokenizer
  //     var path = tokenizer.tokenize(word);
  //     console.log(path);
  //   });
}
