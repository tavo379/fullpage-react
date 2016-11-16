const React = require('react');
const ReactDOM = require('react-dom');

const CONSTS = require('./consts');
const Slide = require('./slide');
const HSlide = require('./hslide');

const {handleScroll, scrollTo} = require('../utils/scrollTo');
const events = require('../utils/events');
const renderUtils = require('../utils/renderUtils');
const {GET_BODY} = renderUtils;

const SCROLL_DIR = CONSTS.SCROLL_DIRECTIONS.X;

/*
GAMEPLAN
access the dom node itself via refs: http://jamesknelson.com/react-js-by-example-interacting-with-the-dom/
now you can add click listeners on the Slider Buttons as well and (maybe even) scroll events on the slider itself vs the document.

A demo is currently running on localhost:8000 of a plain html/css slider.
Also avail here: https://github.com/codepo8/simple-carousel/blob/master/carousel-fancy.html

 */

class Slider extends React.Component {
  constructor(props) {
    super(props);

    let slideChildren = getSlideCount(this.props.children);

    this.state = {
      name: 'Slider',
      defaultClass: 'Slider',
      infinite: this.props.infinite || false,
      reset: !this.props.infinite,
      slides: [],
      slidesCount: slideChildren,
      activeSlide: 0,
      lastActive: -1,
      downThreshold: -Math.abs(this.props.threshold || 100),
      upThreshold: this.props.threshold || 100,
      touchStart: 0,
      touchSensitivity: this.props.sensitivity || 100,
      scrollPending: false
    };

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.goToSlide = this.goToSlide.bind(this);
    // this.onTouchStart = this.onTouchStart.bind(this);
    // this.onTouchEnd = this.onTouchEnd.bind(this);

  }

  goToSlide(slide) {
    events.sub('Fullpage', slide);
  }

  componentDidMount() {
    var sliderNode = this.node;
    sliderNode.addEventListener('wheel', this.onScroll);
    window.addEventListener('resize', this.onResize);

    // document.addEventListener('touchstart', this.onTouchStart);
    // document.addEventListener('touchend', this.onTouchEnd);
    // document.addEventListener('keydown', this.checkKey);
    // events.pub(this, this.scrollToSlide);

    //initialize slides
    this.onResize();
  }

  onResize() {
    let slides = [];

    for (let i = 0; i < this.state.slidesCount; i++) {
      slides.push(window.innerWidth * i);
    }

    this.setState({
      'slides': slides,
      'height': window.innerHeight,
      'width': window.innerWidth
    });

    this.scrollToSlide(this.state.activeSlide, true);
  }

  scrollToSlide(slide, override) {
    console.log(this.state.slides[slide])
    if (override) {
      //now we force a move to the desired slide;

      return scrollTo.call(this, GET_BODY(), SCROLL_DIR, this.state.slides[slide], 100, () => {
        this.setState({'activeSlide': slide});
        this.setState({'scrollPending': false});
      });
    }

    if (this.state.scrollPending) {
      return;
    }

    if (slide < 0 || slide >= this.state.slidesCount) {
      return;
    }

    this.setState({
      'activeSlide': slide,
      'scrollPending': true
    });

    scrollTo(GET_BODY(), SCROLL_DIR, this.state.slides[slide], 600, () => {
      this.setState({'activeSlide': slide});
      this.setState({'scrollPending': false});
    });
  }

  onScroll(e) {
    handleScroll(e, this, SCROLL_DIR);
  }

  render() {
    var regularArr = this.props.children.map((c, idx) => {
      return <div key={idx} style={Object.assign({}, {height: '100%', width: '100%', display: 'inline-block'})}>{c}</div>
    });

    return (
      <div ref={node => this.node = node} style={Object.assign({}, this.props.style, {'overflowX': 'hidden', height: '100%', width: '100%', whiteSpace: 'nowrap', WebkitScrollbar: 'display: none'})}>
        {regularArr}
      </div>
    );
  }
}

module.exports = Slider;

function getSlideCount(children) {
  return children.reduce((result, c) => {
    if (Array.isArray(c)) {
      return getSlideCount(c);
    }

    if (!c.type) {
      return result;
    }

    if (c.type === HSlide) {
      return result = result + 1;
    }

    return result;
  }, 0)
}