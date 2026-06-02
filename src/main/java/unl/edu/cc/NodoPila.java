package unl.edu.cc;

public class NodoPila<T> {
    T tarea;
    NodoPila<T> inferior;

    public NodoPila(T tarea) {
        this.tarea = tarea;
        this.inferior = null;
    }
}