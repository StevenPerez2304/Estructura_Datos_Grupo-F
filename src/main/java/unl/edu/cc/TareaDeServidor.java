package unl.edu.cc;

public class TareaDeServidor {
    private String descripcion;
    private long timestamp;

    public TareaDeServidor(String descripcion) {
        this.descripcion = descripcion;
        this.timestamp = System.currentTimeMillis();
    }

    public String getDescripcion() {
        return descripcion;
    }

    public long getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "TareaDeServidor{" +
                "descripcion='" + descripcion + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}