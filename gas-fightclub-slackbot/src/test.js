const contentText= `<a href="https://finance.yahoo.co.jp/quote/USDJPY=FX" class="_3AlRJB-P" data-cl_cl_index="1"><span class="_3q4fU7EE _1sD9rcAy _2zDQBBun"><span class="_34DSGIzf e-A9dnne _3rMl8eS8" style="width:36px"><span class="_1Fw8yqNV" style="padding-top:61.111111111111114%"></span><img src="https://s.yimg.jp/images/finance/cowry/svg/flag_usdjpy.svg" alt="米ドル/円" width="36" height="22" loading="lazy" class="_2by38_zD"></span></span><h1 class="_2IiVI_CY _17HwaciP">米ドル/円</h1><ul class="_1xikAwa2"><li class="_3TmSX5Uj"><div class="_20-oTsaK"><span class="IL99C0xX">141.813</span></div></li><li class="_3TmSX5Uj"><div class="_20-oTsaK"><span class="IL99C0xX">141.815</span></div></li></ul></a>`

const matchedName = contentText.match(
  new RegExp(/<h1 class=".+">米ドル\/円<\/h1><ul class=".+"><li class=".+"><div class=".+"><span class=".+">(.+)<\/span>/)
)


console.log(matchedName)
// const t2 = matchedName[1]
// const res = t2.match(
//   new RegExp(/\>(.+)\</g)
// )
// console.log( res )
