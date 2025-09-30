/**
 *  http://kenwheeler.github.io/slick/
 */
Slicksettings = {};

Slicksettings.mainMenu = {
    accessibility: true,
    centerMode: false,
    centerPadding: '20px',
    dots: false,
    infinite: false,
    arrows: true,
    variableWidth: true,
    speed: 10,
    swipeToSlide: true,
    slidesToScroll: 1, //moet +/- 14 zijn
};

Slicksettings.administration = {
    accessibility:false,
    centerMode: false,
    centerPadding: '100px',
    padding: '500px',
    dots: false,
    infinite: false,
    arrows: true,
    speed: 300,
    slidesToShow: 7,
    slidesToScroll: 7,
    responsive: [{
    breakpoint: 1600,
        settings: {
                slidesToShow: 6,
                slidesToScroll: 6,
                centerMode: false,
                infinite: true,
                dots: false
            }
    },{
    breakpoint: 1024,
        settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
                centerMode: false,
                infinite: false,
                dots: false
            }},{
        breakpoint: 800,
        settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              centerMode: false,
              infinite: false,
              dots: false
            }},{
        breakpoint: 600,
        settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            centerMode: false,
            infinite: false,
            dots: false
        }}
]};