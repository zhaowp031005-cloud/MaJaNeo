# 口播稿分镜：每个 scene 是一个画面，lines 是旁白句子。
# sub 中的 "|" 是字幕分段；say 是给 TTS 读的文本（缺省等于 sub 去掉 "|"）。
SCENES = [
 ("ban", [
   dict(sub="2026 年上半年，|Claude 全平台封禁了|约 1,140 万个账号。", say="二零二六年上半年，Claude 全平台封禁了约一千一百四十万个账号。"),
   dict(sub="在大陆用 Claude Code|（下面简称 CC）的人，|确实普遍担心封号。", say="在大陆用 Claude Code，下面简称 C C 的人，确实普遍担心封号。"),
 ]),
 ("two", [
   dict(sub="当前主流的方案有两种：|一是部署海外服务器，|二是用 CC 框架|接国内模型的 API。", say="当前主流的方案有两种：一是部署海外服务器，二是用 C C 框架，接国内模型的 A P I。"),
 ]),
 ("cons", [
   dict(sub="两种方案都有弊端。"),
   dict(sub="海外服务器操作麻烦，|对编程小白很不友好。"),
   dict(sub="接国内模型的话，|接入后用的是所选的国内模型，|不是 Claude，|实际能力取决于模型和任务。"),
 ]),
 ("new", [
   dict(sub="今天介绍一种用 CC 的新方式：|用 Grok Bot 调用 Claude Code，|电脑部署在云端。", say="今天介绍一种用 C C 的新方式：用 Grok Bot 调用 Claude Code，电脑部署在云端。"),
 ]),
 ("what", [
   dict(sub="Grok Bot 是跟 X、Cursor、Grok|绑定的 Agent team 工具，"),
   dict(sub="它有自己的云端电脑，|能在上面操作软件、执行任务。"),
 ]),
 ("price", [
   dict(sub="Grok Bot 是每月 30 美元的套餐，|再加上自己的 CC 费用。", say="Grok Bot 是每月三十美元的套餐，再加上自己的 C C 费用。"),
   dict(sub="按 Pro 月付标价算，|两份订阅大约是五十的月费量级，|实际币种、税费以结算为准。"),
 ]),
 ("benefits", [
   dict(sub="它不一定最便宜，|但有四个好处。"),
   dict(sub="第一，|不用自己租服务器。"),
   dict(sub="第二，用的是官方 CC 配 Claude 模型，|具体模型和用量取决于账户权限。", say="第二，用的是官方 C C 配 Claude 模型，具体模型和用量取决于账户权限。"),
   dict(sub="第三，Grok Bot 本身|就是很好用的工具，|方便搭建自己的 AI 团队。"),
   dict(sub="第四，CC 请求从云端电脑发出，|不必在本机单独配置|CC 的网络出口。", say="第四，C C 请求从云端电脑发出，不必在本机单独配置 C C 的网络出口。"),
 ]),
 ("principle", [
   dict(sub="做之前，先了解一下原理。"),
   dict(sub="Grok Bot 有自己的云端 Linux 电脑，|Claude Code 就装在上面。"),
   dict(sub="你发需求，|Bot 通过终端调用 CC，", say="你发需求，Bot 通过终端调用 C C，"),
   dict(sub="不是装一个插件，|也不是把你的请求|交给不明中转商。"),
   dict(sub="你仍然用自己的账户授权。"),
   dict(sub="云端运行不等于账号免封，|Claude 账户与地区规则仍适用。"),
 ]),
 ("overview", [
   dict(sub="下面带着大家|把安装、授权和调用|完整走一遍。"),
 ]),
 ("step1", [
   dict(sub="第一步，|下载并登录 Grok Bot。"),
   dict(sub="在网络能正常访问|官方下载页和登录页的前提下，"),
   dict(sub="从官方下载页下载桌面版，|安装后用 Cursor 账户登录，|确认套餐包含 Grok Bot。"),
 ]),
 ("step2", [
   dict(sub="第二步，|让 Grok Bot 安装 Claude Code。"),
   dict(sub="不用先在自己电脑上开终端，|把这段话直接发给 Bot。"),
   dict(sub="核心就三点：|只在云端电脑上装，|不碰你的本机；"),
   dict(sub="已经装过就报版本号，|不要重复安装；"),
   dict(sub="没装就按官方文档的方式装，|出错也按官方文档排查。"),
   dict(sub="官方安装文档里的安装命令|是这一行。"),
   dict(sub="装完新开一个终端，|验证版本。"),
   dict(sub="这些命令是在|Bot 的云端电脑上运行，|不是在你自己的电脑上。"),
   dict(sub="能显示版本号，|说明程序已经装好，|还不代表登录完成。"),
 ]),
 ("step3", [
   dict(sub="第三步，|登录并授权 Claude Code。"),
   dict(sub="继续对 Bot 说：|请启动 Claude Code，|进入登录流程。"),
   dict(sub="需要浏览器授权时，|停下来让你接管，|不要读取或输出你的密码、|验证码和登录凭据。"),
   dict(sub="启动命令就是 claude。", say="启动命令，就是 Claude 这一个单词。"),
   dict(sub="需要浏览器授权时，|你自己接管完成登录，|使用有 Claude Code 权限的账户。"),
   dict(sub="浏览器没有自动打开，|可以按终端提示复制登录链接。"),
   dict(sub="如果授权页面给出登录码，|就粘回终端对应的提示处，|不要发进聊天。"),
   dict(sub="看到终端显示 Login successful，|再交还给 Bot。"),
   dict(sub="也可以让它检查登录状态。"),
   dict(sub="到这里，程序装好了，|账户也授权了，|接下来才是验证|它能不能实际干活。"),
 ]),
 ("step4", [
   dict(sub="第四步，第一次调用。|把下面这段发给 Grok Bot。"),
   dict(sub="要求它通过终端|调用 Claude Code，|不要自己直接代写代码；"),
   dict(sub="在一个新的空目录里|新建独立项目，|已有内容就换目录，不要覆盖；"),
   dict(sub="让 Claude Code|写一个简单的 HTML 页面，|有标题和按钮，|点击按钮就改变标题文字；", say="让 Claude Code 写一个简单的 H T M L 页面，有标题和按钮，点击按钮就改变标题文字；"),
   dict(sub="只允许修改这个项目目录，|不使用跳过权限检查的参数；"),
   dict(sub="完成后打开页面、|测试按钮、发截图，|并告诉你 Claude Code|实际改了哪些文件。"),
   dict(sub="你收到页面截图、|按钮测试结果|和文件改动清单，|才算把整条流程跑通。"),
 ]),
 ("daily", [
   dict(sub="以后继续在聊天里|提需求就行，"),
   dict(sub="比如让 CC 修改这个页面，|或者先检查问题、给出修改方案，|确认后再动手。", say="比如让 C C 修改这个页面，或者先检查问题、给出修改方案，确认后再动手。"),
   dict(sub="重点是说清楚|让它调用 Claude Code，|以及这次允许改哪些文件。"),
 ]),
 ("trouble", [
   dict(sub="如果又出现登录提示，|先检查授权状态。"),
   dict(sub="如果提示额度用完，|分清是 Grok Bot 的额度，|还是 Claude Code 的额度。"),
   dict(sub="它们是两套，|重置时间以各自提示为准，|不要一报错就重复安装。"),
 ]),
 ("summary", [
   dict(sub="最后给大家一页操作总览，|记得截图保存哦！", pause=3.9),
 ]),
 ("outro", [
   dict(sub="这套方式多花的钱，|主要换来的是|不用自己维护服务器，|以及少操作终端。"),
   dict(sub="祝大家都能稳定、方便地|用上 CC！", say="祝大家都能稳定、方便地用上 C C！"),
   dict(sub="下一期再讲|怎么通过 Grok Bot|搭建自己的 AI 团队，|以及一些实用 tips。"),
 ]),
]
