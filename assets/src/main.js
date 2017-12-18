(function ($) {

    const win = window,
          CEIL = Math.ceil,
          SQRT = Math.sqrt,
          POW = Math.pow,
          rnd = Math.random

    var C = $('canvas'),
        w = $(C).width(),
        h = $(C).height(),
        speedRatio = $(C).data('speedRatio'),
        _self = [],
        getNumbers,
        drawBubble,
        stats,
        animationControl,
        isPaused = false,
        f = true


    innerWidth > win.innerHeight ?
        $(C).attr({
            'width': win.innerWidth * .5,
            'height': win.innerHeight * .75,
            'data-speedRatio': 8
        }) :
        $(C).attr({
            'width': win.innerWidth,
            'height': win.innerHeight * .3,
            'data-speedRatio': 20
        })
    $(win).on('resize', function () {
        win.cancelAnimationFrame(animationControl)
        $(C).clearCanvas({
            x: 0, y: 0,
            width: w * 2, height: h * 2
        })
        win.innerWidth > win.innerHeight ?
            $(C).attr({
                'width': win.innerWidth * .5,
                'height': win.innerHeight * .75,
                'data-speedRatio': 8
            }) :
            $(C).attr({
                'width': win.innerWidth,
                'height': win.innerHeight * .3,
                'data-speedRatio': 20
            })
        w = $(C).width()
        h = $(C).height()
        speedRatio = $(C).attr('data-speedRatio')
    })
    function Bubble(R = h / getRnd(10, 16), unknown = getRnd(2)) {
        this.hue = 'hsl(' + getRnd(361) + ',80%,50%)'
        this.radius = R
        this.strokeStyle = this.hue
        this.shadowColor = this.hue
        this.strokeWidth = R / 25
        this.shadowBlur = R / 5
        this.x = getRnd(R + this.strokeWidth, w - R - this.strokeWidth)
        this.y = getRnd(R + this.strokeWidth, h - R - this.strokeWidth)
        this.toRight = unknown
        this.toBottom = unknown
        this.addX = w / R / speedRatio
        this.addY = h / R / speedRatio
        this.mutualCollisionX = false
        this.mutualCollisionY = false
    }

    (function () {
        this.shadow = function (i) {
            let __R = _self[i].radius,
                __x = _self[i].x,
                __y = _self[i].y

            function BubbleTrail() {
                this.fillStyle = 'rgba(255,255,255,.9)'
                this.rotate = -45
                this.width = __R / 2
                this.height = __R / 6
                this.x = __x - .565685425 * __R
                this.y = __y - .565685425 * __R
                this.shadowColor = '#fff'
                this.shadowBlur = __R / 5
            }

            function BubbleDot(t, a, b) {
                this.fillStyle = 'rgba(255,255,255,.7)'
                this.closed = true
                this.rounded = true
                this.translateX = -.1 * __R
                this.translateY = .1 * __R
                this.shadowColor = '#fff'
                this.shadowBlur = __R / 8
                this.p1 = {
                    type: 'quadratic',
                    x1: __x + t * __R, y1: __y,
                    cx1: __x + a * __R, cy1: __y,
                    x2: __x + b * __R, y2: __y + (1 - t) * __R,
                    cx2: __x + (t - a + b) * __R, cy2: __y + (1 - t) * __R,
                    x3: __x + t * __R, y3: __y
                }
            }

            return {
                bubbleTrail: new BubbleTrail(),
                bubbleDot: new BubbleDot(.8, 1, .9)
            }
        }
        this.cornerCollison = function (i) {
            if (this.toRight) {
                if (this.x >= w - this.radius - this.strokeWidth) {
                    this.toRight = 0
                }
                this.x += this.addX
            } else {
                if (this.x <= this.radius + this.strokeWidth) {
                    this.toRight = 1
                }
                this.x -= this.addX
            }
            if (this.toBottom) {
                if (this.y >= h - this.radius - this.strokeWidth) {
                    this.toBottom = 0
                }
                this.y += this.addY
            } else {
                if (this.y <= this.radius + this.strokeWidth){
                    this.toBottom = 1
                }
                this.y -= this.addY
            }
            $(C).drawArc(this).drawEllipse(this.shadow(i).bubbleTrail).drawPath(this.shadow(i).bubbleDot)
        }
    }).bind(Bubble.prototype)()

    drawBubble = function () {
        stats.update()
        $(C).clearCanvas({
            x: 0, y: 0,
            width: w * 2, height: h * 2
        })
        for (let i = _self.length - 1; i > -1 ; --i) {
            for (let j = i - 1; j > -1; --j) {
                let  a = _self[i], b = _self[j]
                if (SQRT(POW(a.x - b.x, 2) + POW(a.y - b.y, 2)) <= a.radius + b.radius + a.strokeWidth + b.strokeWidth) {
                    if (a.x > b.x) {
                        a.toRight = 1
                        b.toRight = 0
                    } else {
                        a.toRight = 0
                        b.toRight = 1
                    }
                    if (a.y > b.y) {
                        a.toBottom = 1
                        b.toBottom = 0
                    } else {
                        a.toBottom = 0
                        b.toBottom = 1
                    }
                }
            }
            _self[i].cornerCollison(i)
        }
        animationControl = win.requestAnimationFrame(drawBubble)
    }

    getNumbers = function () {
        stats = initStats()
        for (var j = +$('input:first').attr('value') - 1; j > -1 ; j--) {
            _self[j] = new Bubble()
        }
        drawBubble()
    }

    $('#start').on('click', function () {
        if (f) {
            f = false
            $(this).next().prop('disabled', false)
            setTimeout(function () {
                f = true
            }, 1000)
            if (isPaused) {
                isPaused = false
                animationControl = win.requestAnimationFrame(drawBubble)
                return
            }
            _self.length = 0
            $(C).clearCanvas({
                x: 0, y: 0,
                width: w * 2, height: h * 2
            })
            cancelAnimationFrame(animationControl)
            $(this).prev().attr('value') && getNumbers()
        }
    }).next().on('click', function () {
        $(this).prop('disabled', true)
        isPaused = true
        cancelAnimationFrame(animationControl)
    })

    function initStats() {
        var stats = new Stats()
        stats.setMode(0)
        stats.domElement.style.position = 'absolute'
        stats.domElement.style.left = 0
        stats.domElement.style.top = 0
        $('#Stats-output').append(stats.domElement)
        return stats
    }

    function getRnd(n, m) {
        if (arguments.length < 2) {
            m = n
            n = 0
        }
        n = CEIL(n)
        return rnd() * ((m | 0) - n) | 0 + n
    }
})(jQuery)