import type { Artifact } from "@/lib/types";

export const artifacts: Artifact[] = [
  {
    id: "jue",
    title: "青铜爵",
    englishTitle: "Wine warmer (Jue)",
    period: "商代",
    date: "约公元前 16 世纪",
    medium: "青铜",
    image: "/images/jue.jpg",
    code: "MT·001",
    summary:
      "长流、尖尾与三足共同构成爵的轮廓。它不只是容器，也让礼制、铸造技术与宴饮场景在一件器物上交汇。",
    tags: ["青铜", "礼器", "金属", "铸造", "商代", "酒", "工艺"],
    theme: "礼制",
    stop: 1,
    accent: "#aa4b33",
    evidence: [
      {
        label: "形制观察",
        detail: "馆藏记录将其命名为爵，并标注为温酒器；三足、流与鋬是识别这一器形的关键线索。",
        kind: "馆藏记录",
        sourceIndex: 0,
      },
      {
        label: "时代坐标",
        detail: "该器被定年为商代，约公元前 16 世纪。年代判断来自器形、纹饰与铸造特征的综合研究。",
        kind: "历史背景",
        sourceIndex: 0,
      },
      {
        label: "意义留白",
        detail: "礼器的具体使用情境会随考古材料更新，展览叙事应区分“器物事实”与“场景想象”。",
        kind: "学术解读",
        sourceIndex: 1,
      },
    ],
    perspectives: {
      adult:
        "先看它向前伸出的长流，再看稳稳支撑器身的三只足。青铜爵的造型让使用者不必放下器物也能斟酒，而复杂的铸造则需要多块陶范协作完成。",
      child:
        "它像一只长着长嘴巴和三只脚的小怪兽。古人会用它盛酒，工匠还要把滚烫的金属倒进模具里，才能做出这样的形状。",
      accessible:
        "这是一件带长流和尖尾的三足青铜酒器。器身有坚硬的金属触感，长流向前伸出，底部三足呈稳定的三角支撑。",
    },
    sources: [
      {
        title: "Wine warmer (Jue), object 72272",
        publisher: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/72272",
      },
      {
        title: "Chinese Bronzes: Function and Ritual",
        publisher: "The Metropolitan Museum of Art, Heilbrunn Timeline",
        url: "https://www.metmuseum.org/toah/hd/shbr/hd_shbr.htm",
      },
    ],
  },
  {
    id: "jade-ring",
    title: "玉龙环",
    englishTitle: "Knotted dragon ring",
    period: "东周",
    date: "公元前 3 世纪",
    medium: "软玉",
    image: "/images/jade-ring.jpg",
    imagePosition: "center 44%",
    code: "MT·002",
    summary:
      "龙形在环形边界中盘绕、打结。坚硬的玉被琢磨成连续曲线，让材料、技艺与观念不再分离。",
    tags: ["玉器", "龙", "东周", "软玉", "工艺", "纹样", "材料"],
    theme: "材料",
    stop: 2,
    accent: "#536c5e",
    evidence: [
      {
        label: "材料事实",
        detail: "馆藏记录明确材质为软玉，并非所有绿色玉石都属于同一矿物。",
        kind: "馆藏记录",
        sourceIndex: 0,
      },
      {
        label: "造型线索",
        detail: "环体与龙形相互缠绕，说明工匠在有限孔径与环宽中安排连续叙事。",
        kind: "历史背景",
        sourceIndex: 0,
      },
      {
        label: "解释边界",
        detail: "龙形所承载的具体观念可能因地域、使用者与出土环境不同，不能只凭纹样作单一结论。",
        kind: "学术解读",
        sourceIndex: 1,
      },
    ],
    perspectives: {
      adult:
        "绕行一周，你会看到龙的身体如何在圆环中转折、穿插。玉比青铜更难修补，工匠必须预先规划磨削路径，因此造型的流畅也意味着极高的材料控制力。",
      child:
        "这条小龙把自己绕成了一个圈，像在玩捉迷藏。玉很硬，工匠要一点一点磨出来，如果磨坏了就很难补救。",
      accessible:
        "这件玉器近似圆环，表面有连续盘绕的龙形轮廓。材质温润、颜色柔和，纹样并不高出器面，而是通过线条变化形成起伏。",
    },
    sources: [
      {
        title: "Knotted dragon ring, object 39637",
        publisher: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/39637",
      },
      {
        title: "Chinese Jade: Meaning and Craft",
        publisher: "The Metropolitan Museum of Art, Heilbrunn Timeline",
        url: "https://www.metmuseum.org/toah/hd/jade/hd_jade.htm",
      },
    ],
  },
  {
    id: "bi",
    title: "玉璧",
    englishTitle: "Annular disk (Bi)",
    period: "西汉",
    date: "公元前 206—公元 9 年",
    medium: "软玉",
    image: "/images/bi-disc.jpg",
    code: "MT·003",
    summary:
      "外圆、内孔的玉璧看似极简，却是中国古代最具延续性的器形之一。它的用途与含义并非固定不变。",
    tags: ["玉器", "玉璧", "西汉", "礼制", "墓葬", "圆形", "材料"],
    theme: "礼制",
    stop: 3,
    accent: "#76806d",
    evidence: [
      {
        label: "器形事实",
        detail: "馆藏名称为 annular disk（bi），即带中心圆孔的环形玉器。",
        kind: "馆藏记录",
        sourceIndex: 0,
      },
      {
        label: "时代与材质",
        detail: "记录将其定年为西汉，材质为软玉。器物的表面颜色与纹理需结合实物观察。",
        kind: "历史背景",
        sourceIndex: 0,
      },
      {
        label: "用途辨析",
        detail: "玉璧见于礼仪、装饰与墓葬等不同场景，不宜把某一种解释套用于所有玉璧。",
        kind: "学术解读",
        sourceIndex: 1,
      },
    ],
    perspectives: {
      adult:
        "玉璧的魅力来自极简轮廓背后的长期流变。圆与孔的尺度、玉料纹理和墓葬出土环境，才是理解它为何被反复制作、反复解释的入口。",
      child:
        "它像一个中间有洞的圆盘子。不同年代、不同地方的人都做过这样的玉器，但他们使用它的方式不一定相同。",
      accessible:
        "这是一件扁平、圆环形的玉器，中心有孔。轮廓连续而规整，壁面平缓，适合用手指沿边缘感受它的几何形态。",
    },
    sources: [
      {
        title: "Annular disk (bi), object 42840",
        publisher: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/42840",
      },
      {
        title: "Chinese Jade: Meaning and Craft",
        publisher: "The Metropolitan Museum of Art, Heilbrunn Timeline",
        url: "https://www.metmuseum.org/toah/hd/jade/hd_jade.htm",
      },
    ],
  },
  {
    id: "waterfall",
    title: "高士观瀑图",
    englishTitle: "Gentlemen gazing at a waterfall",
    period: "南宋",
    date: "13 世纪",
    medium: "绢本设色",
    image: "/images/waterfall.jpg",
    code: "MT·004",
    summary:
      "山水、人物与观看方式被压缩在扇形画幅中。画中人望向瀑布，也把今天的观众带入同一套“观景”关系。",
    tags: ["书画", "山水", "南宋", "绢", "人物", "自然", "观看", "艺术"],
    theme: "山水",
    stop: 4,
    accent: "#6f6854",
    evidence: [
      {
        label: "作品信息",
        detail: "馆藏记录标为南宋、13 世纪，现为装裱成册页的团扇画面。",
        kind: "馆藏记录",
        sourceIndex: 0,
      },
      {
        label: "媒介线索",
        detail: "作品以绢本设色完成，尺幅有限，却通过留白与远近关系组织山水空间。",
        kind: "历史背景",
        sourceIndex: 0,
      },
      {
        label: "观看关系",
        detail: "画中观瀑者并非简单装饰；他们为观众提供了进入画面的视线，但具体人物身份仍属解释而非定论。",
        kind: "学术解读",
        sourceIndex: 1,
      },
    ],
    perspectives: {
      adult:
        "别急着寻找瀑布。先看人物站立的姿态，再看他们视线指向哪里。宋代山水往往让自然成为主角，而人物只是建立了观看、倾听与沉思的位置。",
      child:
        "画里有几个人正在看瀑布。你可以先找到最亮的水流，再顺着他们的方向看过去，就像和他们一起站在画里。",
      accessible:
        "这是一幅纵向的山水画，人物集中在画面下方。画面上部有淡色山体，瀑布从山间垂下，整体以墨色线条和柔和设色构成。",
    },
    sources: [
      {
        title: "Gentlemen gazing at a waterfall, object 40196",
        publisher: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/40196",
      },
      {
        title: "Landscape Painting in Chinese Art",
        publisher: "The Metropolitan Museum of Art, Heilbrunn Timeline",
        url: "https://www.metmuseum.org/toah/hd/clpg/hd_clpg.htm",
      },
    ],
  },
  {
    id: "jun-bowl",
    title: "钧窑花盆",
    englishTitle: "Bulb bowl, Numbered Jun ware",
    period: "金—元时期",
    date: "13—14 世纪",
    medium: "施釉炻器",
    image: "/images/jun-bowl.jpg",
    code: "MT·005",
    summary:
      "釉色不是后来画上去的图案，而是在窑火中自然流动、乳浊与变化。器物的视觉中心由人、泥、火共同完成。",
    tags: ["陶瓷", "钧窑", "釉", "花盆", "金代", "元代", "火", "工艺"],
    theme: "材料",
    stop: 5,
    accent: "#536f83",
    evidence: [
      {
        label: "器物信息",
        detail: "馆藏记录将其定名为带编号的钧窑花盆，年代约为 13—14 世纪。",
        kind: "馆藏记录",
        sourceIndex: 0,
      },
      {
        label: "材料与工艺",
        detail: "器物为施釉炻器，蓝釉覆盖凸起装饰，釉面在烧成中形成流动与乳浊效果。",
        kind: "历史背景",
        sourceIndex: 0,
      },
      {
        label: "颜色解释",
        detail: "钧釉色彩受釉料、窑温与气氛共同影响；颜色通常不能脱离具体标本直接反推某一固定配方。",
        kind: "学术解读",
        sourceIndex: 1,
      },
    ],
    perspectives: {
      adult:
        "观察釉色在器壁转折处如何聚集、散开。钧窑的迷人之处不只在颜色，更在受控与偶然之间的边界：工匠安排材料与烧成条件，但最终的流动仍由火参与完成。",
      child:
        "它像一只装了蓝天的花盆。上面的颜色会流动，是窑火烤的时候自己做出来的，像给泥巴变了一个颜色魔术。",
      accessible:
        "这是一件浅盆状器物，外壁有起伏的装饰和较厚釉层。蓝色深浅并不均匀，视觉上有柔和的光泽和流动感。",
    },
    sources: [
      {
        title: "Bulb bowl, Numbered Jun ware, object 460663",
        publisher: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/460663",
      },
      {
        title: "Jun Ware in Chinese Ceramics",
        publisher: "The Metropolitan Museum of Art, Heilbrunn Timeline",
        url: "https://www.metmuseum.org/toah/hd/junw/hd_junw.htm",
      },
    ],
  },
  {
    id: "guanyin",
    title: "观音菩萨造像",
    englishTitle: "Bodhisattva, probably Avalokiteshvara",
    period: "北齐",
    date: "约公元 550—560 年",
    medium: "彩绘砂岩",
    image: "/images/guanyin.jpg",
    code: "MT·006",
    summary:
      "身体轮廓被提炼成简洁、安稳的体块。曾经的彩绘大部分已经消失，残留颜色提醒我们：今天看到的样子并非最初完成时的样子。",
    tags: ["造像", "佛教", "观音", "北齐", "砂岩", "彩绘", "雕塑", "信仰"],
    theme: "信仰",
    stop: 6,
    accent: "#8d6952",
    evidence: [
      {
        label: "身份判断",
        detail: "馆藏记录认为可能是观音菩萨，身份判断基于造像特征，同时保留谨慎措辞。",
        kind: "馆藏记录",
        sourceIndex: 0,
      },
      {
        label: "时代坐标",
        detail: "造像约完成于北齐 550—560 年，材质为带彩绘的砂岩。",
        kind: "历史背景",
        sourceIndex: 0,
      },
      {
        label: "时间痕迹",
        detail: "表面颜料经历长期保存与展示后只留下局部痕迹；复原色不能等同于作品最初面貌。",
        kind: "学术解读",
        sourceIndex: 1,
      },
    ],
    perspectives: {
      adult:
        "先看整体轮廓，再看衣褶和面部的简化处理。北齐造像常以体块的连续与身体的稳定感取胜；残留彩绘则提示我们，雕塑原本可能处在更丰富的色彩环境中。",
      child:
        "雕像上一块块淡淡的颜色，是很多很多年前留下的颜料。它以前可能比现在更彩色，但时间把大部分颜色带走了。",
      accessible:
        "这是一尊直立的人物造像，身体轮廓圆润而简洁，表面可见局部色彩痕迹。整体姿态稳定，衣饰线条并不繁密。",
    },
    sources: [
      {
        title: "Bodhisattva, probably Avalokiteshvara, object 42718",
        publisher: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/42718",
      },
      {
        title: "Buddhist Art in China",
        publisher: "The Metropolitan Museum of Art, Heilbrunn Timeline",
        url: "https://www.metmuseum.org/toah/hd/buda/hd_buda.htm",
      },
    ],
  },
  {
    id: "buddha",
    title: "鎏金铜佛坐像",
    englishTitle: "Seated Buddha, probably Shakyamuni",
    period: "北朝十六国时期",
    date: "公元 486 年",
    medium: "分范合铸鎏金铜",
    image: "/images/buddha.jpg",
    code: "MT·007",
    summary:
      "明确的纪年让造像成为类型研究的时间锚点。鎏金表面连接着材料、信仰与跨区域交流的多重线索。",
    tags: ["造像", "佛教", "北魏", "鎏金", "青铜", "日期", "工艺", "信仰"],
    theme: "信仰",
    stop: 7,
    accent: "#9a7b44",
    evidence: [
      {
        label: "纪年记录",
        detail: "馆藏记录标明公元 486 年，即北魏太和十年，这为同类造像提供了明确时间坐标。",
        kind: "馆藏记录",
        sourceIndex: 0,
      },
      {
        label: "制作技术",
        detail: "造像采用分范合铸并施鎏金，说明制作过程涉及复杂模具、金属铸造与表面处理。",
        kind: "历史背景",
        sourceIndex: 0,
      },
      {
        label: "风格判断",
        detail: "风格比较可揭示区域之间的交流，但单件作品不能独立证明某条传播路线，需要更多标本相互印证。",
        kind: "学术解读",
        sourceIndex: 1,
      },
    ],
    perspectives: {
      adult:
        "先留意题记提供的精确时间，再观察坐姿、衣纹与手印。纪年像一枚时间锚点，让研究者能拿它与周边地区的同类造像比较，讨论风格与信仰如何移动。",
      child:
        "这尊小佛像已经有 1500 多岁了。它身上原本闪闪发亮，是因为表面曾经贴了一层金色的金属薄衣。",
      accessible:
        "这是一尊正面端坐的小型佛像，轮廓对称，表面带有金属光泽。衣纹与身体转折相对简洁，适合从坐姿和双手的对称关系开始观察。",
    },
    sources: [
      {
        title: "Seated Buddha, probably Shakyamuni, object 42733",
        publisher: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/42733",
      },
      {
        title: "Buddhist Art in China",
        publisher: "The Metropolitan Museum of Art, Heilbrunn Timeline",
        url: "https://www.metmuseum.org/toah/hd/buda/hd_buda.htm",
      },
    ],
  },
];

export const artifactById = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
