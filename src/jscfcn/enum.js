var ENUM = {};
ENUM.requestType = {
  layout: 'layout',
  all: 'all',
  data: 'data'
};

ENUM.align = {
  left: 'LEFT',
  right: 'RIGHT',
  top: 'TOP',
  bottom: 'BOTTOM',
  center: 'CENTER'
};

ENUM.textAlign = {
  left: 'Left',
  right: 'Right',
  center: 'Center'
};

ENUM.serviceOpen = {
  cursorOnly: '*CSR',
  cursorAndBlank: '*CSRBLK',
  cursorAndError: '*CSRERR'
};

ENUM.authorizationLevel = {
  hidden: '*HIDDEN',
  readonly: '*READONLY'
};

ENUM.expiredOptions = {
  hidden: '*HIDDEN',
  allow: '*ALLOW',
  display: '*DISPLAY'
};

ENUM.fontIconGroup = {
  fontAwesome: 'fontAwesome',
  pthFont: 'pthFont',
  customFont: 'customFont'
};

ENUM.objects = {
  input: '*INPUT',
  output: '*OUTPUT',
  textarea: '*TEXTAREA',
  upload: '*UPLOAD',
  image: '*IMAGE'
};

ENUM.conditionalAttribute = {
  message: '*MSG',
  information: '*INF',
  attention: '*ATN',
  alert: '*ALR',
  error: '*ERR',
  hidden: '*HIDDEN',
  protect: '*PROTECT', //alleen bij input niet bij label
  alignRight: '*RIGHT',
  alignCenter: '*CENTER'
};
ENUM.attentionLevelToMessageStatus = {
  M: 'message',
  W: 'warning',
  S: 'signal',
  A: 'alert',
  F: 'error'
};

ENUM.attentionLevel = {
  message: 'M',
  Warning: 'W',
  Signal: 'S',
  alert: 'A',
  error: 'F',
  sel: 'S'
};

ENUM.attentionLevelToCode = {
  '*MSG': 'M',
  '*INF': 'W',
  '*ATN': 'S',
  '*ALR': 'A',
  '*ERR': 'F',
  '*SEL': 'SEL'
};

ENUM.attentionLevelReverse = {
  M: 'atr_msg',
  W: 'atr_inf',
  S: 'atr_atn',
  A: 'atr_alr',
  F: 'atr_err',
  SEL: 'atr_sel'
};

ENUM.color = {
  red: 'red',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  violet: 'violet',
  black: 'black',
  gray: 'gray',
  brown: 'brown',
  pink: 'pink',
  purple: 'purple'
};

ENUM.skin = {
  blue: '1',
  orange: '2',
  yellow: '3',
  green: '4',
  blue: '5',
  violet: '6',
  black: '7',
  gray: '8'
};

ENUM.dataType = {
  text: 'text',
  data: 'data',
  decimal: 'decimal',
  logical: 'logical',
  link: 'link',
  hidden: 'hidden',
  password: 'password',
  memo: 'memo'
};

ENUM.dataAttribute = {
  upper: 'upper',
  leftBlank: 'leftBlank',
  leftZero: 'leftZero',
  signed: 'signed',
  digit: 'digit'
};

ENUM.fieldAttribute = {
  hidden: 'hidden',
  autosubmit: 'autosubmit', //alleen input
  protected: 'protected', //alleen input
  underline: 'underline', //alleen output
  label: 'label' //alleen output
};

ENUM.blankWhenZero = {
  blank: 'blank',
  zero: 'zero'
};

ENUM.helpId = {
  scan: 'scan',
  leftEqual: 'leftEqual',
  equal: 'equal',
  lower: 'lower',
  upper: 'upper'
};

ENUM.protocol = {
  http: '*HTTP',
  mail: '*MAIL',
  file: '*FILE'
};

ENUM.aliasType = {
  data: 'data',
  label: 'label',
  image: '*IMG'
};

ENUM.thousandSeparator = {
  none: '',
  period: '.',
  comma: ','
};

ENUM.textLevel = {
  '1': '1',
  '1': '2'
};

ENUM.sessionState = {
  active: 'active',
  inactive: 'inactive',
  closed: 'closed'
};

ENUM.jobState = {
  run: 'TIMW',
  end: 'END',
  hld: 'HLD',
  lckw: 'LCKW',
  msgw: 'MSGW'
};

ENUM.resolutions = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  highDef: 'highDef',
  fullHD: 'fullHD'
};

ENUM.screenSize = {
  high: '*HIGH',
  large: '*LARGE',
  classic: '*CLASSIC'
};

ENUM.screenMode = {
  single: 'single',
  double: 'double'
};

ENUM.screenPart = {
  left: 'left',
  right: 'right'
};

ENUM.menuState = {
  open: 'open',
  closed: 'closed'
};

ENUM.selection = {
  none: 'none',
  all: 'all',
  start: 'start',
  end: 'end',
  unKnown: 'unKnown'
};

ENUM.serviceType = {
  retrive: '*RTV',
  display: '*DSP',
  choice: '*CHC',
  calendar: '*CAL'
};

ENUM.serviceAction = {
  userAction: '*USRACT',
  cursor: '*CSR',
  cursorAndBlank: '*CSRBLK',
  cursorAndError: '*CSRERR',
  auto: '*AUTOACT'
};

ENUM.fielProgressionType = {
  singleLine: 'singleLine',
  header: 'header',
  grid: 'grid'
};

ENUM.fielProgressionSubPart = {
  header: 'header'
};

ENUM.quicksearchErrors = {
  subfileFull: 'SubfileFull'
};

ENUM.triggerAction = {
  none: '*NONE',
  update: '*UPDATE'
};

var keyCode = {
  backSpace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  escape: 27,
  space: 32,
  pageUp: 33,
  pageDown: 34,
  arrowLeft: 37,
  arrowUp: 38,
  arrowRight: 39,
  arrowDown: 40,
  del: 46,
  m: 77,
  w: 87,
  numpadPoint: 110,
  point: 110,
  F1: 112,
  F2: 113,
  F3: 112,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  apostrophe: 222,
  numpad0:96,
  numpad9:105
}; 

ENUM.screenMode = { modal: '*MODAL', subview: '*SUBVIEW' };
ENUM.invoke = { external: '*EXTERNAL', internal: '*INTERNAL' };
ENUM.FLOW = { free: '*FREE', strict: '*STRICT' };
