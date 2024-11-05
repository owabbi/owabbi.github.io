import { randomNumBetween } from "./tools.js";

export default class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static addition(vectorA, vectorB) {
        return new Vector(vectorA.x + vectorB.x, vectorA.y + vectorB.y);
    }

    static multiplication(vector, value) {
        return new Vector(vector.x * value, vector.y * value);
    }

    static division(vector, value) {
        return new Vector(vector.x / value, vector.y / value);
    }

    static substraction(vectorA, vectorB) {
        return new Vector(vectorA.x - vectorB.x, vectorA.y - vectorB.y);
    }

    //Produit scalaire
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    //Vecteur tangent
    getTangent() {
        return new Vector(-this.y, this.x);
    }


    //Norme
    mag() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    static random(minX, maxX, minY, maxY) {
        return new Vector(randomNumBetween(minX, maxX), randomNumBetween(minY, maxY));
    }
}