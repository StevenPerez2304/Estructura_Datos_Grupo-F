package unl.edu.cc;

public class ControladorTareas {

    private PilaHistorial<TareaDeServidor> pilaDeshacer;
    private PilaHistorial<TareaDeServidor> pilaRehacer;

    public ControladorTareas() {
        pilaDeshacer = new PilaHistorial<>();
        pilaRehacer = new PilaHistorial<>();
    }

    public static void main(String[] args) {

        ControladorTareas controlador = new ControladorTareas();

        // 1. Asignación de 3 tareas al servidor
        TareaDeServidor tarea1 = new TareaDeServidor("Respaldo de base de datos");
        TareaDeServidor tarea2 = new TareaDeServidor("Actualización del sistema");
        TareaDeServidor tarea3 = new TareaDeServidor("Monitoreo de red");

        controlador.pilaDeshacer.push(tarea1);
        controlador.pilaDeshacer.push(tarea2);
        controlador.pilaDeshacer.push(tarea3);

        System.out.println("=== Tareas activas ===");
        System.out.println("Última tarea activa: "
                + controlador.pilaDeshacer.peek().getDescripcion());

        // 2. Deshacer la última tarea
        TareaDeServidor tareaRevertida = controlador.pilaDeshacer.pop();
        controlador.pilaRehacer.push(tareaRevertida);

        System.out.println("\n=== Acción Deshacer ===");
        System.out.println("Tarea revertida: "
                + tareaRevertida.getDescripcion());

        // 3. Verificación
        System.out.println("\n=== Verificación ===");
        System.out.println("Nueva última tarea activa: "
                + controlador.pilaDeshacer.peek().getDescripcion());

        System.out.println("Tarea en pila de rehacer: "
                + controlador.pilaRehacer.peek().getDescripcion());

        System.out.println("¿La tarea revertida sigue activa? "
                + tareaRevertida.getDescripcion().equals(
                controlador.pilaDeshacer.peek().getDescripcion()));
    }
}
