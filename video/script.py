# 口播稿分镜：每个 scene 是一个画面，lines 是旁白句子。
# sub 中的 "|" 是字幕分段；say 是给 TTS 读的文本（缺省等于 sub 去掉 "|" 和强调标记）。
# 字幕强调标记（只影响字幕显示，不影响配音）：
#   {重点}  黄色荧光笔划线      [警示]  红色（“不要…”“不是…”这类）
# 人名/产品名/数字会自动上色（Claude 橙、Bot 靛蓝、数字红、技术词蓝）。
# 每句可选 speed=… 单独调语速；pause=… 句后额外停顿（配合 HOLDS 悬停展示）；silent=秒数 表示无旁白的静默段。
SCENES = [
 ("rant", [  # 开场“贴脸大字”：全屏大字代替底部字幕，语速稍快
   dict(sub="就在今天，|Fable 5.2 推出了！", say="就在今天，Fable 五点二推出了！", speed=1.12),
   dict(sub="其代码能力|完全[断档] Opus 5.5。", say="其代码能力，完全断档 Opus 五点五。", speed=1.12),
   dict(sub="可是我澡尔冯了个福的|Anthropic 和 OpenAI|都[不是人]！", say="可是我澡尔冯了个福的 Anthropic 和 OpenAI，都不是人！", speed=1.15),
   dict(sub="2026 年上半年，|Claude 全平台封禁了|约 1,140 万个账号，", say="二零二六年上半年，Claude 全平台封禁了约一千一百四十万个账号，", speed=1.1),
   dict(sub="OpenAI 最近|也开始了[大规模封号]。", say="OpenAI 最近，也开始了大规模封号。", speed=1.1),
 ]),
 ("ban", [
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
   dict(sub="从下面这个链接{下载桌面版}，|安装后{登录}即可。"),
   dict(sub="大家可以{复制这个链接}。", pause=3.2),          # 悬停：放大链接 + 背景虚化
   dict(sub="确认套餐{包含 Grok Bot}。"),
   dict(sub="除了 [Plus 计划]，|其他三个计划|都有 Grok Bot {对应的额度}，|大家根据自己的用量|{按需充值}即可。"),
   dict(sub="同时补充一个信息：|现在 Grok Bot 也能用{支付宝}支付了！"),
 ]),
 ("step2", [
   dict(sub="第二步，|让 Grok Bot {安装 Claude Code}。"),
   dict(sub="先在 Grok Bot 上|创建一个{子 agent}，|可以把它命名为 {Claude Code 助手}。"),
   dict(sub="这个主要是为了{术业有专攻}，|CC 相关的任务|都扔给 {CC 助手}。", say="这个主要是为了术业有专攻，C C 相关的任务都扔给 C C 助手。"),
   dict(sub="接着不用先在自己电脑上开终端，|把这段话{直接发给 Bot}："),
   dict(sub="大家可以{截图一下这个命令}。", pause=3.2),        # 悬停：放大指令 + 背景虚化
   dict(sub="Claude Code 助手安装完，|能显示版本号，|说明{程序已经装好}，|[还不代表登录完成]。"),
 ]),
 ("step3", [
   dict(sub="第三步，|{登录并授权} Claude Code。"),
   dict(sub="首先注册一个 {Claude 账号}，|通过 {Gmail} 即可。"),
   dict(sub="接着回到 Grok Bot，|继续对 Bot 说："),
   dict(sub="大家可以{截图一下这个命令}。", pause=3.2),
   dict(sub="需要浏览器授权时，|{你自己接管}完成登录。"),
   dict(sub="浏览器没有自动打开，|可以按终端提示{复制登录链接}。"),
   dict(sub="如果授权页面给出{登录码}，|就{粘回终端}对应的提示处，|[不要发进聊天]。"),
   dict(sub="[尽量不要直接在聊天框输入登录码]，|可以保证一下{帐号安全}。"),
   dict(sub="看到终端显示 {Login successful}，|再{交还给 Bot}。"),
   dict(sub="到这里，{程序装好了}，|{账户也授权了}，|接下来才是验证|它能不能{实际干活}。"),
 ]),
 ("step4", [
   dict(sub="第四步，{第一次调用}。|把下面这段发给 Grok Bot："),
   dict(sub="大家可以{截图一下这个命令}。", pause=3.2),
   dict(sub="你收到{页面截图}、|{按钮测试结果}|和{文件改动清单}，|才算把整条流程{跑通}。"),
 ]),
 ("daily", [
   dict(sub="以后继续在聊天里|{提需求}就行，"),
   dict(sub="比如让 CC 助手{修改这个页面}，|或者先检查问题、{给出修改方案}，|{确认后}再动手。", say="比如让 C C 助手修改这个页面，或者先检查问题、给出修改方案，确认后再动手。"),
   dict(sub="{重点}是说清楚|让它{调用 Claude Code}，|以及这次{允许改哪些文件}。"),
 ]),
 ("trouble", [
   dict(sub="如果又出现{登录提示}，|先{检查授权状态}。"),
   dict(sub="如果提示{额度用完}，|分清是 {Grok Bot 的额度}，|还是 {Claude Code 的额度}。"),
   dict(sub="它们是{两套}，|重置时间以{各自提示}为准，|[不要一报错就重复安装]。"),
 ]),
 ("summary", [
   dict(silent=5.0),   # 原稿括号里的要求：只展示总结页供截图，不配旁白
 ]),
 ("outro", [
   dict(sub="这套方式多花的钱，|主要换来的是|{不用自己维护服务器}，|以及{少操作终端}。"),
   dict(sub="祝大家都能{稳定、方便地}|用上 CC！", say="祝大家都能稳定、方便地用上 C C！"),
 ]),
 ("follow", [
   dict(sub="我是 {DaHa}，|球球大家的{点赞、收藏}？{关注}！！|球球了！！", say="我是大哈，球球大家的点赞、收藏？关注！！球球了！！"),
   dict(sub="下一期我们再讲|怎么通过 Grok Bot|{搭建自己的 AI 团队}，|以及一些{实用 tips}。", say="下一期我们再讲怎么通过 Grok Bot 搭建自己的 AI 团队，以及一些实用 tips。"),
 ]),
]
