import * as React from 'react';
import Chess from './index';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

describe('Chess game', () => {

  it('should pass sanity check', () => {
    const wrapper = mount(<Chess match={{params: {}}}/>);
    expect(wrapper.text().length).to.be.above(0);
  });

});