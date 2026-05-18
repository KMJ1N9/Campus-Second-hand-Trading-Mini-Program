/**
 * validator.js 单元测试
 *
 * 运行方式：
 *   npx jest tests/validator.test.js
 * 或（如未安装 jest）：
 *   npm install --save-dev jest
 *   npx jest tests/validator.test.js
 */

var validator = require('../miniprogram/utils/validator.js');

describe('validator.required', function () {
  it('空字符串应返回错误', function () {
    expect(validator.required('', '标题')).toBe('标题不能为空');
    expect(validator.required('  ', '标题')).toBe('标题不能为空');
  });

  it('undefined 和 null 应返回错误', function () {
    expect(validator.required(undefined, '字段')).toBe('字段不能为空');
    expect(validator.required(null, '字段')).toBe('字段不能为空');
  });

  it('非空值应通过', function () {
    expect(validator.required('hello', '标题')).toBe('');
    expect(validator.required(123, '数字')).toBe('');
  });
});

describe('validator.maxLength', function () {
  it('超长应返回错误', function () {
    expect(validator.maxLength('12345678901', 10, '标题')).toBe('标题不能超过10个字');
  });

  it('未超长应通过', function () {
    expect(validator.maxLength('12345', 10, '标题')).toBe('');
  });

  it('空值应通过（由 required 单独校验）', function () {
    expect(validator.maxLength('', 10, '标题')).toBe('');
    expect(validator.maxLength(undefined, 10, '标题')).toBe('');
  });
});

describe('validator.isNumber', function () {
  it('非数字应返回错误', function () {
    expect(validator.isNumber('abc', '价格')).toBe('价格必须是数字');
  });

  it('数字字符串应通过', function () {
    expect(validator.isNumber('123', '价格')).toBe('');
    expect(validator.isNumber('12.5', '价格')).toBe('');
  });

  it('空值应通过', function () {
    expect(validator.isNumber('', '价格')).toBe('');
    expect(validator.isNumber(undefined, '价格')).toBe('');
  });
});

describe('validator.minValue', function () {
  it('小于最小值应返回错误', function () {
    expect(validator.minValue('0.001', 0.01, '价格')).toBe('价格不能小于0.01');
  });

  it('大于等于最小值应通过', function () {
    expect(validator.minValue('0.01', 0.01, '价格')).toBe('');
    expect(validator.minValue('100', 0.01, '价格')).toBe('');
  });

  it('非数字应通过（由 isNumber 单独校验）', function () {
    expect(validator.minValue('abc', 0.01, '价格')).toBe('');
  });
});

describe('validator.validateGoods', function () {
  var validData = {
    images: ['cloud://test-image.jpg'],
    title: '二手教材',
    price: '25',
    category: 'textbook',
    condition: 'used',
    description: '九成新教材，几乎没用过'
  };

  it('完整有效数据应通过', function () {
    var result = validator.validateGoods(validData);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('缺少图片应报错', function () {
    var data = Object.assign({}, validData, { images: [] });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.images).toBeTruthy();
  });

  it('超过9张图片应报错', function () {
    var data = Object.assign({}, validData, {
      images: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.images).toBe('最多上传9张图片');
  });

  it('缺少标题应报错', function () {
    var data = Object.assign({}, validData, { title: '' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeTruthy();
  });

  it('标题超过30字应报错', function () {
    var data = Object.assign({}, validData, { title: '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.title).toBeTruthy();
  });

  it('缺少价格应报错', function () {
    var data = Object.assign({}, validData, { price: '' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.price).toBeTruthy();
  });

  it('价格为非数字应报错', function () {
    var data = Object.assign({}, validData, { price: 'abc' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.price).toBe('价格必须是数字');
  });

  it('价格小于0.01应报错', function () {
    var data = Object.assign({}, validData, { price: '0' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.price).toBe('价格不能小于0.01');
  });

  it('原价为非数字应报错', function () {
    var data = Object.assign({}, validData, { originalPrice: 'abc' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.originalPrice).toBe('原价必须是数字');
  });

  it('缺少分类应报错', function () {
    var data = Object.assign({}, validData, { category: '' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.category).toBeTruthy();
  });

  it('缺少成色应报错', function () {
    var data = Object.assign({}, validData, { condition: '' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.condition).toBeTruthy();
  });

  it('缺少描述应报错', function () {
    var data = Object.assign({}, validData, { description: '' });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeTruthy();
  });

  it('描述超过500字应报错', function () {
    var longDesc = '';
    for (var i = 0; i < 501; i++) { longDesc += 'a'; }
    var data = Object.assign({}, validData, { description: longDesc });
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeTruthy();
  });

  it('可选原价不填应通过', function () {
    var data = Object.assign({}, validData);
    delete data.originalPrice;
    var result = validator.validateGoods(data);
    expect(result.valid).toBe(true);
  });
});
