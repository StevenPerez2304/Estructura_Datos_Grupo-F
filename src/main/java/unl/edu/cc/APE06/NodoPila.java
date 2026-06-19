package unl.edu.cc.APE06;

public class NodoPila<T> {
    T tarea;
    NodoPila<T> inferior;

    public NodoPila(T tarea) {
        this.tarea = tarea;
        this.inferior = null;
    }
}