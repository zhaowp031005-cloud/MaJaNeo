# 口播稿分镜：每个 scene 是一个画面，lines 是旁白句子。
# sub 中的 "|" 是字幕分段；say 是给 TTS 读的文本（缺省等于 sub 去掉 "|" 和强调标记）。
# 字幕强调标记（只影响字幕显示，不影响配音）：
#   {重点}  黄色荧光笔划线      [警示]  红色（“不要…”“不是…”这类）
# 人名/产品名/数字会自动上色（Claude 橙、Bot 靛蓝、数字红、技术词蓝）。
# 每句可选 speed=… 单独调语速；pause=… 句后额外停顿。
SCENES = [
 ("rant", [  # 开场“贴脸大字”吐槽：全屏大字代替底部字幕，语速稍快
   dict(sub="澡尔冯了个福的|OpenAI 和 Anthropic，|都[太不是人了]！", speed=1.15),
   dict(sub="扔扔的猫吴，|也[不是人类]！", speed=1.15),
   dict(sub="就在最近，|猫吴从 Anthropic|跳槽去了 OpenAI；", say="就在最近，猫吴从 Anthropic 跳槽去了 OpenAI；", speed=1.12),
   dict(sub="而 OpenAI|昨天就开始了[大规模封号]！", say="而 OpenAI，昨天就开始了大规模封号！", speed=1.12),
 ]),
 ("ban", [
   dict(sub="2026 年上半年，|Claude 更是全平台[封禁]了|约 1,140 万个账号。", say="二零二六年上半年，Claude 更是全平台封禁了约一千一百四十万个账号。"),
   dict(sub="因此当下有个{稳定、方便且性价比高}的|调用 Codex 和 Claude Code 的方式|显得{尤为重要}。"),
 ]),
 ("two", [
   dict(sub="当前主流的方案有{两种}：|一是部署{海外服务器}，|二是用 CC 框架|接{国内模型的 API}。", say="当前主流的方案有两种：一是部署海外服务器，二是用 C C 框架，接国内模型的 A P I。"),
 ]),
 ("cons", [
   dict(sub="两种方案都有[弊端]。"),
   dict(sub="海外服务器[操作麻烦]，|对编程小白[很不友好]。"),
   dict(sub="接国内模型的话，|由于[不是 Opus 或 Astra]，|CC 和 Codex 架构再好，|实际表现结果也[不如人意]。", say="接国内模型的话，由于不是 Opus 或 Astra，C C 和 Codex 架构再好，实际表现结果也不如人意。"),
 ]),
 ("new", [
   dict(sub="因此！今天介绍一种|{稳定调用 Codex 和 Claude Code}的新方法，|也就是通过最近很火的 agent tool|——{Grok Bot}！", say="因此！今天介绍一种稳定调用 Codex 和 Claude Code 的新方法，也就是通过最近很火的 agent tool，Grok Bot！"),
 ]),
 ("what", [
   dict(sub="在介绍方法之前，|我们先了解 {Grok Bot 是啥}？"),
   dict(sub="Grok Bot 是跟 X、Cursor、Grok|绑定的 {Agent team 工具}，"),
   dict(sub="它有{自己的云端电脑}，|能在上面{操作软件、执行任务}。"),
 ]),
 ("stable", [
   dict(sub="其次了解一下，|为啥 Grok Bot 可以{稳定、高性价比}地|使用 Codex 和 Claude Code？"),
   dict(sub="第一，{稳定}：|Grok Bot 有自己的{云端 Linux 电脑}，|Claude Code 和 Codex {就装在上面}。"),
   dict(sub="因此 Claude Code 和 Codex 的 IP|本身就{在美国}，非常纯净。"),
 ]),
 ("value", [
   dict(sub="第二，{高性价比}：|Grok Bot 是{每月 30 美元}的套餐，|再加上自己的 CC 和 Codex 费用。", say="第二，高性价比：Grok Bot 是每月三十美元的套餐，再加上自己的 C C 和 Codex 费用。"),
   dict(sub="按 Pro 月付标价算，|两份订阅大约是{五十的月费量级}。"),
   dict(sub="这样既能稳定地用到 Codex 和 CC，|同时 Grok Bot 的套餐|也带上 {Cursor、Grok、Twitter 的会员}，", say="这样既能稳定地用到 Codex 和 C C，同时 Grok Bot 的套餐也带上 Cursor、Grok、Twitter 的会员，"),
   dict(sub="对于构建自己的 {AI team}、|做{自媒体}都很有帮助。"),
 ]),
 ("overview", [
   dict(sub="如果到现在你觉得这个方案你能接受，|我们下面带着大家|把{安装、授权和调用}|完整走一遍，|下面以 {Claude Code} 为例。"),
 ]),
 ("step1", [
   dict(sub="第一步，|{下载并登录} Grok Bot。"),
   dict(sub="在网络能正常访问|官方下载页和登录页的{前提}下，"),
   dict(sub="从{官方下载页}下载桌面版，|安装后用 {Cursor 账户}登录，|确认套餐{包含 Grok Bot}。"),
   dict(sub="同时补充一个信息：|现在 Grok Bot 也能用{支付宝}支付了！"),
 ]),
 ("step2", [
   dict(sub="第二步，|让 Grok Bot {安装 Claude Code}。"),
   dict(sub="[不用]先在自己电脑上开终端，|把这段话{直接发给 Bot}。"),
   dict(sub="核心就{三点}：|{只在云端电脑上装}，|[不碰你的本机]；"),
   dict(sub="已经装过就{报版本号}，|[不要重复安装]；"),
   dict(sub="没装就按{官方文档}的方式装，|出错也按{官方文档}排查。"),
   dict(sub="官方安装文档里的{安装命令}|是这一行。"),
   dict(sub="装完新开一个终端，|{验证版本}。"),
   dict(sub="这些命令是在|{Bot 的云端电脑}上运行，|[不是在你自己的电脑上]。"),
   dict(sub="能显示版本号，|说明{程序已经装好}，|[还不代表登录完成]。"),
 ]),
 ("step3", [
   dict(sub="第三步，|{登录并授权} Claude Code。"),
   dict(sub="继续对 Bot 说：|请启动 Claude Code，|{进入登录流程}。"),
   dict(sub="需要浏览器授权时，|停下来{让你接管}，|[不要读取或输出你的密码]、|验证码和登录凭据。"),
   dict(sub="启动命令就是 {claude}。", say="启动命令，就是 Claude 这一个单词。"),
   dict(sub="需要浏览器授权时，|{你自己接管}完成登录，|使用有 Claude Code {权限的账户}。"),
   dict(sub="浏览器没有自动打开，|可以按终端提示{复制登录链接}。"),
   dict(sub="如果授权页面给出{登录码}，|就{粘回终端}对应的提示处，|[不要发进聊天]。"),
   dict(sub="看到终端显示 {Login successful}，|再{交还给 Bot}。"),
   dict(sub="也可以让它{检查登录状态}。"),
   dict(sub="到这里，{程序装好了}，|{账户也授权了}，|接下来才是验证|它能不能{实际干活}。"),
 ]),
 ("step4", [
   dict(sub="第四步，{第一次调用}。|把下面这段发给 Grok Bot。"),
   dict(sub="要求它{通过终端}|调用 Claude Code，|[不要自己直接代写代码]；"),
   dict(sub="在一个{新的空目录}里|新建独立项目，|已有内容就换目录，[不要覆盖]；"),
   dict(sub="让 Claude Code|写一个{简单的 HTML 页面}，|有标题和按钮，|点击按钮就{改变标题文字}；", say="让 Claude Code 写一个简单的 H T M L 页面，有标题和按钮，点击按钮就改变标题文字；"),
   dict(sub="{只允许修改这个项目目录}，|[不使用跳过权限检查的参数]；"),
   dict(sub="完成后{打开页面}、|{测试按钮}、{发截图}，|并告诉你 Claude Code|{实际改了哪些文件}。"),
   dict(sub="你收到{页面截图}、|{按钮测试结果}|和{文件改动清单}，|才算把整条流程{跑通}。"),
 ]),
 ("daily", [
   dict(sub="以后继续在聊天里|{提需求}就行，"),
   dict(sub="比如让 CC {修改这个页面}，|或者先检查问题、{给出修改方案}，|{确认后}再动手。", say="比如让 C C 修改这个页面，或者先检查问题、给出修改方案，确认后再动手。"),
   dict(sub="{重点}是说清楚|让它{调用 Claude Code}，|以及这次{允许改哪些文件}。"),
 ]),
 ("trouble", [
   dict(sub="如果又出现{登录提示}，|先{检查授权状态}。"),
   dict(sub="如果提示{额度用完}，|分清是 {Grok Bot 的额度}，|还是 {Claude Code 的额度}。"),
   dict(sub="它们是{两套}，|重置时间以{各自提示}为准，|[不要一报错就重复安装]。"),
 ]),
 ("summary", [
   dict(sub="下面是操作方式的{一页总结}，|大家可以{截图保存}哦！", pause=3.9),
 ]),
 ("outro", [
   dict(sub="这套方式多花的钱，|主要换来的是|{不用自己维护服务器}，|以及{少操作终端}。"),
   dict(sub="祝大家都能{稳定、方便地}|用上 CC！", say="祝大家都能稳定、方便地用上 C C！"),
 ]),
 ("follow", [
   dict(sub="我是 {DaHa}，|球球大家的{点赞、收藏、关注}，|球球了！", say="我是大哈，球球大家的点赞、收藏、关注，球球了！"),
   dict(sub="下一期我们再讲|怎么通过 Grok Bot|{搭建自己的 AI 团队}，|以及一些{实用 tips}。", say="下一期我们再讲怎么通过 Grok Bot 搭建自己的 AI 团队，以及一些实用 tips。"),
 ]),
]
