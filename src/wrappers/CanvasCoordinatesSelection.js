import CanvasCoordinates from './CanvasCoordinates';

class CanvasCoordinatesSelection {

     constructor(coord1, coord2) {
         this.coord1 = coord1;
         this.coord2 = coord2;
     }

     getCoord1() {
         return this.coord1;
     }

     getCoord2() {
         return this.coord2;
     }

     contains(coord) {
        return (coord.getX() >= this.coord1.getX() && coord.getX() <= this.coord2.getX() && coord.getY() >= this.coord1.getY() && coord.getY() <= this.coord2.getY());
     }
}

export default CanvasCoordinatesSelection;