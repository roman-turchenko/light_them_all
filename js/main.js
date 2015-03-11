/**
 * Created by roman.turchenko on 05.03.15.
 */
console.log("Start!");
/**
 * Field 400x400px
 * Ceil  40x40px
 */

// settings
var size_x = 15,
    size_y = 15,
    ceil_x = 40,
    ceil_y = 40;



var wires = {},
    emptines = {};

$(document).ready(function(){

    $('.c, .p, .w').click(function(){

        var rotation = 1*this.dataset.rotation+90;

        if( rotation >= 360 ){
            rotation = 0;
        }

        this.style.webkitTransform = 'rotate('+rotation+'deg)';
        this.dataset.rotation = rotation;

        console.log(this.className+': '+this.dataset.rotation);
    });


    // generate the field
    var field = $(".field"),
        x = 0, y = size_y;

    field.width(ceil_x * size_x);
    field.height(ceil_y * size_y);

    for( i = 0; i<(size_x*size_y); i++ ){


        if( ++x == size_x+1 ){
            x = 1, y--;
        }
        if( y == size_y+1 ) y = 1;

        field.append('<div class="ceil" id="x'+x+'_y'+y+'" data-x="'+x+'" data-y="'+y+'"></div>');
    }

    /**
     * Directions:
     *  1 - top
     *  2 - right
     *  3 - bottom
     *  4 - left
     *
     * Branches: 1 or 2
     */
    // find the random start point
    var start_point = {
        x: getRandomInt(size_x - (size_x - 4), size_x-4),
        y: getRandomInt(size_y - (size_y - 4), size_y-4),
    }


    var c = 0;

    function build( start_point ){

        c++;

        /**
         * пока все клетки полностью не определены как
         * провода или пустоты (промежутки между проводами)
         */

        if( (Object.keys(wires).length + Object.keys(emptines).length) < size_x*size_y ){

            /**
             * Если это самый первый, инициирующий вызов
             * Заполняем wires и emptines значениями из start_point
             * Это будут данные об источнике питания
             */
            if( Object.keys(wires).length == 0 && Object.keys(emptines).length == 0 ){
                
                // заносим в массив wires источник питания
                // первая точка источника питания
                wires['x'+start_point.x+'_'+'y'+start_point.y] = {type: 'battery'};

                // Вторую точку выбираем рандомно
                var points = getAvaliablePoint(start_point.x, start_point.y);
                var random_point = getRandomPoint(points);
                wires['x'+random_point.x+'_y'+random_point.y] = {type: 'battery'};


            }else{

            }
        }

        if ( c > 2 ) return;
    }

    var c = 0

    function _build(start_point){

        console.log(c);

        c++;
        //if( c > 2 ) return false;



        /**
         * пока все клетки полностью не определены как
         * провода или пустоты (промежутки между проводами)
         */
        //if( (Object.keys(wires).length + Object.keys(emptines).length) < size_x*size_y ){

            // Находим доступные вокруг точки
            var avaliable_points = getAvaliablePoint(start_point.x, start_point.y);

            console.log('avaliable_points:');
            console.log(avaliable_points);

            if( avaliable_points !== false ){

                // Заносим стартовую точку в провода
                wires['x'+start_point.x+'_y'+start_point.y] = {type: Object.keys(wires).length == 0 ? 'start' : 'battery'};

                // Заносим точки по диагонали от стартовой в пустоту
                var diagonal_points = getDiagonalPionts(start_point.x, start_point.y);

                // объединяем доступные точки и диагональные точки
                var all_points = avaliable_points.concat(diagonal_points);

                console.log('all_points');
                console.log(all_points);

                // Заносим все доступные точки в пустоту
                all_points.forEach(function(v,k){
                    emptines['x'+v.x+'_y'+ v.y] = true;
                });

                // Определяем, сколько веток у нас будет
                var branches_num = getBranchesNum();

                // Определяем следующую клетку для каждой ветки
                for( var i = 0; i < branches_num; i++ ){

                    var next_point = getRandomPoint(avaliable_points);
                    var key = 'x'+next_point.x+'_y'+ next_point.y;

                    // Добавляем найденую клетку в провода
                    wires[key] = {type: 'battery'};
                    // Удаляем найденую клетку из пустот
                    delete emptines[key];

                    // Удаляем еще одну клетку из диагоналей, что бы дать возможность свернуть

                    _build(next_point);
                }

            }else{
                wires['x'+start_point.x+'_y'+start_point.y] = {type: 'lamp'}
                return;
            }




            //console.log(avaliable_points);
        //}
    }

    /**
     * Получить массив доступных точек
     * @param x
     * @param y
     * @returns {*}
     */
    function getAvaliablePoint( x, y ){

        var result = filtred_result = [];

        // если точки угловые
        if( (x == 1 || x == size_x) && (y == 1 || y == size_y) ){

            result = [
                {x: x, y: ( y == 1 ? y + 1: y - 1)},
                {x: ( x == 1 ? x + 1: x - 1), y: y},
            ];

        }else if( y == 1 ){// точка на нижнем ребре
            result = [
                {x: x + 1, y: y},
                {x: x - 1, y: y},
                {x: x,     y: y + 1}
            ];

        }else if( x == 1 ){// точка на левом ребре
            result = [
                {x: x,     y: y + 1},
                {x: x,     y: y - 1},
                {x: x + 1, y: y}
            ];

        }else if( x == size_x ){// точка на правом ребре
            result = [
                {x: x,     y: y + 1},
                {x: x,     y: y - 1},
                {x: x - 1, y: y}
            ];
        }else if( y == size_y ){// точка на верхней грани
            result = [
                {x: x + 1, y: y},
                {x: x - 1, y: y},
                {x: x,     y: y - 1}
            ];

        }else{ //точка где-то в центре

            result = [
                {x: x - 1, y: y},     // слева
                {x: x,     y: y + 1}, // сверху
                {x: x + 1, y: y},     // справа
                {x: x,     y: y - 1}
            ];
        }

        /**
         * Проверяем полученные точки
         * Берем только те, которых нет в проводах и пустотах
         */
        var i = 0; while( i < result.length ){

            var key = 'x'+result[i].x+'_y'+result[i].y;

            if( !wires[key] && !emptines[key] ){
                filtred_result.push(result[i]);
            } i++;
        }

        //console.log('Filtered result:');
        //console.log(filtred_result);

        return filtred_result.length ? filtred_result : false;
    }

    function getDiagonalPionts(x, y){
        var result = [];

        // Левый нижний
        if ( x - 1 > 0 && y - 1 > 0 )
            result.push({x: x - 1, y: y - 1});

        // Левый верхний
        if( x - 1 > 0 && y + 1 <= size_y  )
            result.push({x: x - 1, y: y + 1});

        // Правый верхний
        if( x + 1 <= size_x && y + 1 <= size_y )
            result.push({x: x + 1, y: y + 1});

        // правый нижний
        if( x + 1 <= size_x && y - 1 > 0 )
            result.push({x: x + 1, y: y - 1});

        // Проверяем, что бы диагональные точки небыли частью пустоты или проводов
        var i = 0; while( i < result.length ){

            var key = 'x'+result[i].x+'_y'+result[i].y;

            // если нашли - удаляем
            if( wires[key] || emptines[key] ){
                result.splice(result.splice(i,1));
            } i++;
        }

        return result;
    }


    function getRandomPoint( points_array ){
        return points_array[getRandomInt(0, points_array.length-1)];
    }


    //build(start_point);
    _build(start_point);


    if( Object.keys(wires).length > 0 ){
        Object.keys(wires).forEach(function(v, k){

            $(document.getElementById(v)).addClass(wires[v].type);
        });
    }
    //console.log(wires);
});

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBranchesNum(){
    var data = [1,1,1,1,1,1,1,1,1,2];
    return data[getRandomInt(0, data.length - 1)];
}



