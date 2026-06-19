package unl.edu.cc.APE06;

public class PilaHistorial<T> {
    private NodoPila<T> cima;
    private int tamaño;

    public PilaHistorial() {
        this.cima = null;
        this.tamaño = 0;
    }

    // Inserta un elemento en la cima de la pila
    public void push(T tarea) {
        NodoPila<T> nuevo = new NodoPila<>(tarea);
        nuevo.inferior = cima;
        cima = nuevo;
        tamaño++;
    }

    // Elimina y devuelve el elemento de la cima
    public T pop() {
        if (estaVacia()) {
            throw new IllegalStateException("El historial está vacío. No hay acciones para deshacer.");
        }

        T tareaDeshecha = cima.tarea;
        cima = cima.inferior;
        tamaño--;
        return tareaDeshecha;
    }

    // Consulta el elemento de la cima sin eliminarlo
    public T peek() {
        if (estaVacia()) {
            throw new IllegalStateException("La pila está vacía.");
        }
        return cima.tarea;
    }

    // Verifica si la pila está vacía
    public boolean estaVacia() {
        return cima == null;
    }

    // Devuelve la cantidad de elementos
    public int getTamaño() {
        return tamaño;
    }
}