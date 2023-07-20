const { poolPromise , sql } = require('./config_mssql');

async function firstRun(){
    console.log("Running first run...")
    const pool = await poolPromise;
    const result = await pool.request()
        .query(`
    
        ------------------------------------///SCHEMAS-------------------------------------------
        
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'PALA')
        BEGIN
            EXEC('CREATE SCHEMA PALA;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'CAMION')
        BEGIN
            EXEC('CREATE SCHEMA CAMION;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'FLOTA')
        BEGIN
            EXEC('CREATE SCHEMA FLOTA;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'USUARIO')
        BEGIN
            EXEC('CREATE SCHEMA USUARIO;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'MATERIAL')
        BEGIN
            EXEC('CREATE SCHEMA MATERIAL;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'SECTOR')
        BEGIN
            EXEC('CREATE SCHEMA SECTOR;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'CICLO')
        BEGIN
            EXEC('CREATE SCHEMA CICLO;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'RECORRIDO')
        BEGIN
            EXEC('CREATE SCHEMA RECORRIDO;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'FACTOR_CARGA')
        BEGIN
            EXEC('CREATE SCHEMA FACTOR_CARGA;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'ZONA')
        BEGIN
            EXEC('CREATE SCHEMA ZONA;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'RAJO')
        BEGIN
            EXEC('CREATE SCHEMA RAJO;')	
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'PLAN')
        BEGIN
            EXEC('CREATE SCHEMA [PLAN];')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'COMBINACION')
        BEGIN
            EXEC('CREATE SCHEMA COMBINACION;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'PRODUCCION')
        BEGIN
            EXEC('CREATE SCHEMA PRODUCCION;')
        END;
        
        
        
        
        
        ---------------------------------///TABLES---------------------------
        
        
        
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PALA' AND schema_id = SCHEMA_ID('PALA'))
        BEGIN
        CREATE TABLE PALA.PALA(
            ID_PALA SMALLINT IDENTITY(1,1) PRIMARY KEY,
            CODIGO VARCHAR(16) UNIQUE NOT NULL
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FLOTA' AND schema_id = SCHEMA_ID('CAMION'))
        BEGIN
        CREATE TABLE CAMION.FLOTA(
            ID_FLOTA SMALLINT IDENTITY(1,1) PRIMARY KEY,
            CODIGO VARCHAR(16) UNIQUE NOT NULL
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CAMION' AND schema_id = SCHEMA_ID('CAMION'))
        BEGIN
        CREATE TABLE CAMION.CAMION(
            ID_CAMION SMALLINT IDENTITY(1,1) PRIMARY KEY,
            CODIGO VARCHAR(16) UNIQUE NOT NULL,
            ID_FLOTA SMALLINT REFERENCES CAMION.FLOTA(ID_FLOTA)
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PALA_CAMION' AND schema_id = SCHEMA_ID('COMBINACION'))
        BEGIN
        CREATE TABLE COMBINACION.PALA_CAMION(
            ID_PC SMALLINT IDENTITY(1,1) PRIMARY KEY,
            ID_PALA SMALLINT REFERENCES PALA.PALA(ID_PALA),
            ID_CAMION SMALLINT REFERENCES CAMION.CAMION(ID_CAMION),
            UNIQUE(ID_PALA,ID_CAMION)
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'USUARIO' AND schema_id = SCHEMA_ID('USUARIO'))
        BEGIN
        CREATE TABLE USUARIO.USUARIO(
            ID SMALLINT IDENTITY(1,1) PRIMARY KEY,
            [ADMIN] BIT DEFAULT 0,
            CORREO VARCHAR(255) NOT NULL UNIQUE,
            [CONTRASEÑA] VARCHAR(255)
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RAJO' AND schema_id = SCHEMA_ID('RAJO'))
        BEGIN
        CREATE TABLE RAJO.RAJO(
            ID_RAJO TINYINT IDENTITY(1,1) PRIMARY KEY,
            NOMBRE VARCHAR(16) UNIQUE NOT NULL
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PERMISO' AND schema_id = SCHEMA_ID('USUARIO'))
        BEGIN
        CREATE TABLE USUARIO.PERMISO(
            ID SMALLINT IDENTITY(1,1) PRIMARY KEY,
            ID_RAJO TINYINT REFERENCES RAJO.RAJO(ID_RAJO),
            ID_USUARIO SMALLINT REFERENCES [USUARIO].[USUARIO](ID) ON DELETE CASCADE,
            UNIQUE(ID_USUARIO,ID_RAJO)
        );
        END;
            
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ZONA' AND schema_id = SCHEMA_ID('ZONA'))
        BEGIN
        CREATE TABLE ZONA.ZONA(
            ID_ZONA SMALLINT IDENTITY(1,1) PRIMARY KEY,
            ZONA VARCHAR(16) UNIQUE NOT NULL
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ZONA_RAJO' AND schema_id = SCHEMA_ID('COMBINACION'))
        BEGIN
        CREATE TABLE COMBINACION.ZONA_RAJO(
            ID_ZR SMALLINT IDENTITY(1,1) PRIMARY KEY,
            ID_ZONA SMALLINT REFERENCES ZONA.ZONA(ID_ZONA),
            ID_RAJO TINYINT REFERENCES RAJO.RAJO(ID_RAJO),
            UNIQUE(ID_ZONA,ID_RAJO)
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MATERIAL' AND schema_id = SCHEMA_ID('MATERIAL'))
        BEGIN
        CREATE TABLE MATERIAL.MATERIAL(
            ID_MATERIAL SMALLINT IDENTITY(1,1) PRIMARY KEY,
            NOMBRE VARCHAR(32) UNIQUE
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SECTOR' AND schema_id = SCHEMA_ID('SECTOR'))
        BEGIN
        CREATE TABLE SECTOR.SECTOR(
            ID_SECTOR SMALLINT IDENTITY(1,1) PRIMARY KEY,
            TIPO CHAR(1),
            NOMBRE VARCHAR(24) UNIQUE
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ORIGEN_DESTINO' AND schema_id = SCHEMA_ID('COMBINACION'))
        BEGIN
        CREATE TABLE COMBINACION.ORIGEN_DESTINO(
            ID_OD SMALLINT IDENTITY(1,1) PRIMARY KEY,
            ID_ORIGEN SMALLINT REFERENCES SECTOR.SECTOR(ID_SECTOR),
            ID_DESTINO SMALLINT REFERENCES SECTOR.SECTOR(ID_SECTOR),
            UNIQUE(ID_ORIGEN,ID_DESTINO)
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ORI_DEST_ZON_RAJ' AND schema_id = SCHEMA_ID('COMBINACION'))
        BEGIN
        CREATE TABLE COMBINACION.ORI_DEST_ZON_RAJ(
            ID_ODZR SMALLINT IDENTITY(1,1) PRIMARY KEY,
            ID_OD SMALLINT REFERENCES COMBINACION.ORIGEN_DESTINO(ID_OD),
            ID_ZR SMALLINT REFERENCES COMBINACION.ZONA_RAJO(ID_ZR),
            UNIQUE(ID_OD,ID_ZR)
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ORI_DEST_ZON_RAJ_MAT' AND schema_id = SCHEMA_ID('COMBINACION'))
        BEGIN
        CREATE TABLE COMBINACION.ORI_DEST_ZON_RAJ_MAT(
            ID_ODZRM SMALLINT IDENTITY(1,1) PRIMARY KEY,
            ID_MATERIAL SMALLINT REFERENCES MATERIAL.MATERIAL(ID_MATERIAL),
            ID_ODZR SMALLINT REFERENCES COMBINACION.ORI_DEST_ZON_RAJ(ID_ODZR),
            UNIQUE(ID_ODZR,ID_MATERIAL)
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RECORRIDO' AND schema_id = SCHEMA_ID('RECORRIDO'))
        BEGIN
        CREATE TABLE RECORRIDO.RECORRIDO(
            ID_RECORRIDO INT IDENTITY(1,1) PRIMARY KEY,
            ID_ODZRM SMALLINT REFERENCES COMBINACION.ORI_DEST_ZON_RAJ_MAT(ID_ODZRM),
            ID_PC SMALLINT REFERENCES COMBINACION.PALA_CAMION(ID_PC)
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CICLO' AND schema_id = SCHEMA_ID('CICLO'))
        BEGIN
        CREATE TABLE CICLO.CICLO(
            ID_CICLO INT IDENTITY(1,1) PRIMARY KEY NONCLUSTERED,
            FECHA DATE NOT NULL,
            ID_RECORRIDO INT REFERENCES RECORRIDO.RECORRIDO(ID_RECORRIDO),
            VUELTAS REAL NOT NULL,
            FACTOR REAL NOT NULL
        );
        CREATE CLUSTERED INDEX IDX_CICLO_FECHA ON CICLO.CICLO (FECHA);
        END;
        
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FACTOR_CARGA' AND schema_id = SCHEMA_ID('FACTOR_CARGA'))
        BEGIN
        CREATE TABLE FACTOR_CARGA.FACTOR_CARGA(
            ID_FC SMALLINT IDENTITY(1,1) PRIMARY KEY,
            ID_FLOTA SMALLINT REFERENCES CAMION.FLOTA(ID_FLOTA),
            ID_ORIGEN SMALLINT REFERENCES SECTOR.SECTOR(ID_SECTOR),
            TONELAJE REAL NOT NULL,
            FECHA_INI DATE NOT NULL,
            FECHA_FIN DATE NOT NULL
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DELETED' AND schema_id = SCHEMA_ID('FACTOR_CARGA'))
        BEGIN
        CREATE TABLE FACTOR_CARGA.DELETED(
            ID_DEL INT IDENTITY(1,1) PRIMARY KEY,
            ID_FC SMALLINT,
            ID_FLOTA SMALLINT,
            ID_ORIGEN SMALLINT,
            TONELAJE REAL NOT NULL,
            FECHA_INI DATE NOT NULL,
            FECHA_FIN DATE NOT NULL,
            DELETED_DATE DATE
        );
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EXTRACCION_ZR_D' AND schema_id = SCHEMA_ID('PLAN'))
        BEGIN
        CREATE TABLE [PLAN].EXTRACCION_ZR_D(
            ID_EXTRACCION INT IDENTITY(1,1) PRIMARY KEY NONCLUSTERED,
            ID_ZR SMALLINT REFERENCES COMBINACION.ZONA_RAJO(ID_ZR),
            FECHA DATE NOT NULL,
            TONELAJE REAL NOT NULL
        );
        CREATE CLUSTERED INDEX IDX_EXTRACCION_ZR_D_FECHA ON [PLAN].EXTRACCION_ZR_D (FECHA);
        END;
        
        
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TOTAL_EXTRACCION_DR' AND schema_id = SCHEMA_ID('PLAN'))
        BEGIN
        CREATE TABLE [PLAN].TOTAL_EXTRACCION_DR(
            ID_EXTRACCION INT IDENTITY(1,1) PRIMARY KEY NONCLUSTERED,
            ID_RAJO TINYINT REFERENCES RAJO.RAJO(ID_RAJO),
            FECHA DATE NOT NULL,
            TONELAJE REAL NOT NULL
        );
        CREATE CLUSTERED INDEX IDX_TOTAL_EXTRACCION_DR_FECHA ON [PLAN].TOTAL_EXTRACCION_DR (FECHA)
        END;
        
        ---------------------------------///PROCEDURE--------------------------
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CAMION.SP_INSERT_CAMION') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE CAMION.SP_INSERT_CAMION(@CODIGO VARCHAR(16), @ID_FLOTA SMALLINT) AS
        BEGIN
            INSERT INTO CAMION.CAMION (CODIGO, ID_FLOTA) VALUES (@CODIGO, @ID_FLOTA);
        END;')
        END;
        
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CAMION.SP_INSERT_FLOTA') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE CAMION.SP_INSERT_FLOTA(@CODIGO VARCHAR(16)) AS
            BEGIN
            INSERT INTO CAMION.FLOTA (CODIGO) VALUES (@CODIGO);
            END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CAMION.SP_INSERT_CAMION') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE SP_INSERT_CAMION(@CODIGO VARCHAR(16), @ID_FLOTA SMALLINT) AS
            BEGIN
            INSERT INTO CAMION.CAMION (CODIGO, ID_FLOTA) VALUES (@CODIGO, @ID_FLOTA);
            END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.SP_INSERT_CICLO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE CICLO.SP_INSERT_CICLO(@FECHA DATE,@ID_RECORRIDO INT,@VUELTAS REAL,@FACTOR REAL) AS
        BEGIN
            INSERT INTO CICLO.CICLO(FECHA,ID_RECORRIDO,VUELTAS,FACTOR) VALUES(@FECHA,@ID_RECORRIDO,@VUELTAS,@FACTOR);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.SP_UPDATE_CICLO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE CICLO.SP_UPDATE_CICLO(@ID_CICLO INT,@VUELTAS REAL,@FACTOR REAL) AS
                BEGIN
                DECLARE @VUELTAS_PREV_CI REAL,@FACTOR_PREV_CI REAL;
                    SET @VUELTAS_PREV_CI=CICLO.GET_VUELTAS(@ID_CICLO);
                    SET @FACTOR_PREV_CI= CICLO.GET_FACTOR(@ID_CICLO);
        
                    UPDATE CICLO.CICLO 
                    SET VUELTAS=@VUELTAS+@VUELTAS_PREV_CI,FACTOR=(@VUELTAS*@FACTOR+@VUELTAS_PREV_CI*@FACTOR_PREV_CI)/(@VUELTAS +@VUELTAS_PREV_CI)
                    WHERE ID_CICLO=@ID_CICLO
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.SP_INSERT_ORI_DEST_ZON_RAJ') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE COMBINACION.SP_INSERT_ORI_DEST_ZON_RAJ(@ID_OD SMALLINT, @ID_ZR SMALLINT) AS
        BEGIN
            INSERT INTO COMBINACION.ORI_DEST_ZON_RAJ (ID_OD, ID_ZR) VALUES (@ID_OD, @ID_ZR);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.SP_INSERT_ORI_DEST_ZON_RAJ_MAT') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE COMBINACION.SP_INSERT_ORI_DEST_ZON_RAJ_MAT(@ID_ODZR SMALLINT, @ID_MATERIAL SMALLINT) AS
        BEGIN
            INSERT INTO COMBINACION.ORI_DEST_ZON_RAJ_MAT (ID_ODZR, ID_MATERIAL) VALUES (@ID_ODZR, @ID_MATERIAL);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.SP_INSERT_ORIGEN_DESTINO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE COMBINACION.SP_INSERT_ORIGEN_DESTINO(@ID_ORIGEN SMALLINT, @ID_DESTINO SMALLINT) AS
        BEGIN
            INSERT INTO COMBINACION.ORIGEN_DESTINO (ID_ORIGEN, ID_DESTINO) VALUES (@ID_ORIGEN, @ID_DESTINO);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.SP_INSERT_PALA_CAMION') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE COMBINACION.SP_INSERT_PALA_CAMION(@ID_PALA SMALLINT, @ID_CAMION SMALLINT) AS
        BEGIN
            INSERT INTO COMBINACION.PALA_CAMION (ID_PALA, ID_CAMION) VALUES (@ID_PALA, @ID_CAMION);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.SP_INSERT_USUARIO_PERMISO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE USUARIO.SP_INSERT_USUARIO_PERMISO(@ID_RAJO TINYINT,@ID_USER SMALLINT) AS
        BEGIN
            INSERT INTO USUARIO.PERMISO(ID_RAJO,ID_USUARIO) VALUES(@ID_RAJO,@ID_USER);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.SP_INSERT_ZONA_RAJO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE COMBINACION.SP_INSERT_ZONA_RAJO(@ID_ZONA SMALLINT, @ID_RAJO TINYINT) AS
        BEGIN
            INSERT INTO COMBINACION.ZONA_RAJO(ID_ZONA, ID_RAJO) VALUES (@ID_ZONA, @ID_RAJO);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MATERIAL.SP_INSERT_MATERIAL') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE MATERIAL.SP_INSERT_MATERIAL(@NOMBRE VARCHAR(32)) AS
        BEGIN
            INSERT INTO MATERIAL.MATERIAL(NOMBRE) VALUES (@NOMBRE);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'PALA.SP_INSERT_PALA') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROC PALA.SP_INSERT_PALA(@CODIGO VARCHAR(16)) AS
        BEGIN
            INSERT INTO PALA.PALA(CODIGO) VALUES(@CODIGO);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'RAJO.SP_INSERT_RAJO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE RAJO.SP_INSERT_RAJO(@NOMBRE VARCHAR(16)) AS
        BEGIN
            INSERT INTO RAJO.RAJO (NOMBRE) VALUES (@NOMBRE);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'RECORRIDO.SP_INSERT_RECORRIDO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE RECORRIDO.SP_INSERT_RECORRIDO(@ID_ODZRM SMALLINT, @ID_PC SMALLINT) AS
        BEGIN
            INSERT INTO RECORRIDO.RECORRIDO (ID_ODZRM, ID_PC) VALUES (@ID_ODZRM, @ID_PC);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SECTOR.SP_INSERT_SECTOR') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE SECTOR.SP_INSERT_SECTOR(@TIPO CHAR(1), @NOMBRE VARCHAR(24)) AS
        BEGIN
            INSERT INTO SECTOR.SECTOR (TIPO, NOMBRE) VALUES (@TIPO, @NOMBRE);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.SP_INSERT_USUARIO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE USUARIO.SP_INSERT_USUARIO(@ADMIN BIT,@CORREO VARCHAR(255),@PASSWORD VARCHAR(200)) AS
        BEGIN
            INSERT INTO USUARIO.USUARIO([ADMIN],CORREO,CONTRASEÑA) VALUES(@ADMIN,@CORREO,@PASSWORD);
        END;
        ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.SP_INSERT_DELETED') AND type in (N'P', N'PC'))
        BEGIN
           EXEC(' CREATE PROCEDURE FACTOR_CARGA.SP_INSERT_DELETED(@ID_FC SMALLINT,@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@TONELAJE REAL,@FECHA_INI DATE,@FECHA_FIN DATE) AS
        BEGIN
            INSERT INTO FACTOR_CARGA.DELETED(ID_FC,ID_FLOTA,ID_ORIGEN,TONELAJE,FECHA_INI,FECHA_FIN,DELETED_DATE) 
                           VALUES (@ID_FC,@ID_FLOTA,@ID_ORIGEN,@TONELAJE,@FECHA_INI,@FECHA_FIN,GETDATE());
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ZONA.SP_INSERT_ZONA') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE ZONA.SP_INSERT_ZONA(@ZONA VARCHAR(16)) AS
        BEGIN
            INSERT INTO ZONA.ZONA (ZONA) VALUES (@ZONA);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.SP_INSERT_FACTOR_CARGA') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE FACTOR_CARGA.SP_INSERT_FACTOR_CARGA(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FACTOR REAL,@FECHA_INI DATE,@FECHA_FIN DATE) AS
        BEGIN
            IF(NOT(@FECHA_INI>@FECHA_FIN))
            BEGIN 
                INSERT INTO FACTOR_CARGA.FACTOR_CARGA(ID_FLOTA,ID_ORIGEN,TONELAJE,FECHA_INI,FECHA_FIN) VALUES (@ID_FLOTA,@ID_ORIGEN,@FACTOR,@FECHA_INI,@FECHA_FIN);
            END   
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].SP_INSERT_TOTAL_EXTRACCION_DR') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE [PLAN].SP_INSERT_TOTAL_EXTRACCION_DR(@ID_RAJO SMALLINT,@FECHA DATE,@TONELAJE REAL) AS 
        BEGIN
            INSERT INTO [PLAN].TOTAL_EXTRACCION_DR(ID_RAJO,FECHA,TONELAJE) VALUES (@ID_RAJO,@FECHA,@TONELAJE)
        END;')
        END;
        
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].SP_INSERT_EXTRACCION_ZR_D') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('
        CREATE PROCEDURE [PLAN].SP_INSERT_EXTRACCION_ZR_D(@ID_ZR SMALLINT,@FECHA DATE,@TONELAJE REAL) AS 
        BEGIN
            INSERT INTO [PLAN].EXTRACCION_ZR_D(ID_ZR,FECHA,TONELAJE) VALUES (@ID_ZR,@FECHA,@TONELAJE)
        END;')
        END;
        
        
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.SP_INSERT_CICLO_FULL') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE CICLO.SP_INSERT_CICLO_FULL(
                                @FECHA DATE,
                                @PALA VARCHAR(8),
                                @CAMION VARCHAR(14),
                                @FLOTA VARCHAR(16),
                                @MATERIAL VARCHAR(32),
                                @ORIGEN VARCHAR(25),
                                @ZONA VARCHAR(16),
                                @DESTINO VARCHAR(24),
                                @TONELAJE REAL,
                                @VUELTAS REAL,
                                @RAJO VARCHAR(16))
                    AS
                    BEGIN
                    DECLARE @ID_PALA SMALLINT,@ID_CAMION SMALLINT,
                            @ID_MATERIAL SMALLINT,@ID_ORIGEN SMALLINT,
                            @ID_ZONA SMALLINT,@ID_DESTINO SMALLINT,
                            @ID_RAJO SMALLINT,@ID_CICLO SMALLINT,
                            @FACTOR_POR_CICLO REAL,@ID_FLOTA SMALLINT,
                            @TIPO_SECTOR CHAR,@ID_ODZR SMALLINT,
                            @ID_ODZRM SMALLINT,@ID_OD SMALLINT,
                            @ID_PC SMALLINT,@ID_ZR SMALLINT,
                            @ID_RECORRIDO INT;
        
                    SET @FACTOR_POR_CICLO=@TONELAJE/@VUELTAS;
        
                    IF(PALA.IS_IN_PALA(@PALA)=0)
                    BEGIN
                        EXECUTE PALA.SP_INSERT_PALA @PALA;
                    END
        
                    IF(CAMION.IS_IN_FLOTA(@FLOTA)=0)
                    BEGIN
                        EXECUTE CAMION.SP_INSERT_FLOTA @FLOTA;
                    END
        
                    SET @ID_FLOTA= CAMION.GET_ID_FLOTA(@FLOTA);
        
                    IF(CAMION.IS_IN_CAMION(@CAMION)=0)
                    BEGIN
                        EXECUTE CAMION.SP_INSERT_CAMION @CAMION,@ID_FLOTA;
                    END
        
                    IF(MATERIAL.IS_IN_MATERIAL(@MATERIAL)=0)
                    BEGIN
                        EXECUTE MATERIAL.SP_INSERT_MATERIAL @MATERIAL;
                    END
        
                    IF(ZONA.IS_IN_ZONA(@ZONA)=0)
                    BEGIN
                        EXECUTE ZONA.SP_INSERT_ZONA @ZONA;
                    END
        
                    IF(RAJO.IS_IN_RAJO(@RAJO)=0)
                    BEGIN
                        EXECUTE RAJO.SP_INSERT_RAJO @RAJO;
                    END
        
                    IF(SECTOR.IS_IN_SECTOR(@ORIGEN)=0)
                    BEGIN
                        SET @TIPO_SECTOR= SECTOR.GET_TYPE_SECTOR(@ZONA,@RAJO,@ORIGEN);
                        EXECUTE SECTOR.SP_INSERT_SECTOR @TIPO_SECTOR,@ORIGEN;
                    END
        
                    IF(SECTOR.IS_IN_SECTOR(@DESTINO)=0)
                    BEGIN
                        SET @TIPO_SECTOR= SECTOR.GET_TYPE_SECTOR(@ZONA,@RAJO,@DESTINO);
                        EXECUTE SECTOR.SP_INSERT_SECTOR @TIPO_SECTOR,@DESTINO;
                    END
        
                    SET @ID_CAMION=CAMION.GET_ID_CAMION(@CAMION);
                    SET @ID_PALA=PALA.GET_ID_PALA(@PALA);
        
                    IF(COMBINACION.IS_IN_PALA_CAMION(@ID_PALA,@ID_CAMION)=0)
                    BEGIN
                        EXECUTE COMBINACION.SP_INSERT_PALA_CAMION @ID_PALA,@ID_CAMION;
                    END
        
                    SET @ID_ZONA=ZONA.GET_ID_ZONA(@ZONA);
                    SET @ID_RAJO=RAJO.GET_ID_RAJO(@RAJO);
        
                    IF(COMBINACION.IS_IN_ZONA_RAJO(@ID_ZONA,@ID_RAJO)=0)
                    BEGIN
                        EXECUTE COMBINACION.SP_INSERT_ZONA_RAJO @ID_ZONA,@ID_RAJO;
                    END
        
                    SET @ID_ORIGEN=SECTOR.GET_ID_SECTOR(@ORIGEN);
                    SET @ID_DESTINO=SECTOR.GET_ID_SECTOR(@DESTINO);
        
                    IF(COMBINACION.IS_IN_ORIGEN_DESTINO(@ID_ORIGEN,@ID_DESTINO)=0)
                    BEGIN
                        EXECUTE COMBINACION.SP_INSERT_ORIGEN_DESTINO @ID_ORIGEN,@ID_DESTINO;
                    END
        
                    SET @ID_OD=COMBINACION.GET_ID_ORIGEN_DESTINO(@ID_ORIGEN,@ID_DESTINO);
                    SET @ID_ZR=COMBINACION.GET_ID_ZONA_RAJO(@ID_ZONA,@ID_RAJO);
        
                    IF(COMBINACION.IS_IN_ORI_DEST_ZON_RAJ(@ID_OD,@ID_ZR)=0)
                    BEGIN
                        EXECUTE COMBINACION.SP_INSERT_ORI_DEST_ZON_RAJ @ID_OD,@ID_ZR;
                    END
        
                    SET @ID_MATERIAL=MATERIAL.GET_ID_MATERIAL(@MATERIAL);
                    SET @ID_ODZR=COMBINACION.GET_ID_ORI_DEST_ZON_RAJ(@ID_OD,@ID_ZR);
                    
                    IF(COMBINACION.IS_IN_ORI_DEST_ZON_RAJ_MAT(@ID_MATERIAL,@ID_ODZR)=0)
                    BEGIN
                        EXECUTE COMBINACION.SP_INSERT_ORI_DEST_ZON_RAJ_MAT @ID_ODZR,@ID_MATERIAL;
                    END
        
                    SET @ID_PC=COMBINACION.GET_ID_PALA_CAMION(@ID_PALA,@ID_CAMION);
                    SET @ID_ODZRM=COMBINACION.GET_ID_ORI_DEST_ZON_RAJ_MAT(@ID_MATERIAL,@ID_ODZR);
        
                    IF(RECORRIDO.IS_IN_RECORRIDO(@ID_ODZRM,@ID_PC)=0)
                    BEGIN
                        EXECUTE RECORRIDO.SP_INSERT_RECORRIDO @ID_ODZRM,@ID_PC;
                    END
        
                    SET @ID_RECORRIDO =RECORRIDO.GET_ID_RECORRIDO(@ID_ODZRM,@ID_PC);
                    
                    IF(CICLO.CICLO_IS_FACTOR_CARGA(@ID_FLOTA,@ID_ORIGEN,@FECHA)=1)
                    BEGIN 
                         
                        SET @FACTOR_POR_CICLO=FACTOR_CARGA.GET_FACTOR_BY_DATE(@ID_FLOTA,@ID_ORIGEN,@FECHA);
                    END
                    IF(CICLO.IS_IN_CICLO(@FECHA,@ID_RECORRIDO)=0)
                    BEGIN 
                        EXECUTE CICLO.SP_INSERT_CICLO @FECHA,@ID_RECORRIDO,@VUELTAS,@FACTOR_POR_CICLO;
                    END
                    ELSE 
                    BEGIN
                        SET @ID_CICLO=CICLO.GET_ID_CICLO(@FECHA,@ID_RECORRIDO);
                        
                        EXECUTE CICLO.SP_UPDATE_CICLO @ID_CICLO,@VUELTAS,@FACTOR_POR_CICLO;
                    END
                    END;')
        
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.SP_INSERT_USUARIO_PERMISO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE USUARIO.SP_INSERT_USUARIO_PERMISO(@ID_RAJO TINYINT,@ID_USER SMALLINT) AS
        BEGIN
            INSERT INTO USUARIO.PERMISO(ID_RAJO,ID_USUARIO) VALUES(@ID_RAJO,@ID_USER);
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.SP_INSERT_PERMISO_FULL') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROC USUARIO.SP_INSERT_PERMISO_FULL(@CORREO VARCHAR(255),@RAJO VARCHAR(16)) AS 
        BEGIN
            DECLARE @ID_USUARIO SMALLINT,@ID_RAJO TINYINT;
        
            SET @ID_USUARIO=USUARIO.GET_ID(@CORREO);
            SET @ID_RAJO=RAJO.GET_ID_RAJO(@RAJO);
            IF((USUARIO.IS_IN_PERMISO(@ID_USUARIO,@ID_RAJO)=0)) AND (@ID_RAJO IS NOT NULL) AND (@ID_USUARIO IS NOT NULL)
            BEGIN
                EXECUTE USUARIO.SP_INSERT_USUARIO_PERMISO @ID_RAJO,@ID_USUARIO;
            END
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.DELETE_PERMISOS') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE USUARIO.DELETE_PERMISOS(@CORREO VARCHAR(255)) 
                    AS 
                    BEGIN
                        DECLARE @ID_USUARIO SMALLINT;
                        SET @ID_USUARIO=USUARIO.GET_ID(@CORREO);
                        EXECUTE USUARIO.SP_DELETE_PERMISO @ID_USUARIO;
                    END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].GET_REPORTE_MENSUAL_FASE') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE USUARIO.SP_DELETE_PERMISO(@ID_USUARIO SMALLINT) AS
        BEGIN 
            DELETE FROM USUARIO.PERMISO
            WHERE ID_USUARIO =@ID_USUARIO
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.SP_INSERT_FACTOR_CARGA_FULL') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE FACTOR_CARGA.SP_INSERT_FACTOR_CARGA_FULL(@FLOTA VARCHAR(16),@ORIGEN VARCHAR(24),@FACTOR REAL,@FECHA_INI DATE,@FECHA_FIN DATE)
        AS
            BEGIN
            DECLARE @ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@ID_FC SMALLINT,@TONELAJE REAL,@FECHA DATE,@FECHA2 DATE;
        
        
            SET @ID_FLOTA =CAMION.GET_ID_FLOTA(@FLOTA);
            SET @ID_ORIGEN= SECTOR.GET_ID_SECTOR(@ORIGEN);
        
            --3)
            IF((FACTOR_CARGA.FF_LIKE_FF(@ID_FLOTA,@ID_ORIGEN,@FECHA_FIN)= 1) AND
                    (FACTOR_CARGA.FI_LIKE_FI(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI)=1))
            BEGIN 
                EXECUTE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA @ID_FLOTA,@ID_ORIGEN,@FACTOR,@FECHA_INI,@FECHA_FIN;
            END
            ELSE 
            BEGIN 
                --14)---
                IF ((FACTOR_CARGA.INSIDE_ANOTHER(@ID_FLOTA, @ID_ORIGEN, @FECHA_INI, @FECHA_FIN)) = 1)
                BEGIN
                    SET @ID_FC = FACTOR_CARGA.GET_ID_FOR_INSIDE(@ID_FLOTA, @ID_ORIGEN, @FECHA_INI, @FECHA_FIN);
                    SET @TONELAJE = FACTOR_CARGA.GET_TONELAJE_BY_ID(@ID_FC);
                    SET @FECHA = CAST(DATEADD(DAY, 1, @FECHA_FIN) AS DATE);
                    SET @FECHA2 = FACTOR_CARGA.GET_FECHA_FIN(@ID_FC);
            
                    BEGIN TRANSACTION;
            
                    EXECUTE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FF @ID_FC, @FECHA_INI;
            
                    COMMIT TRANSACTION;
        
            
                    BEGIN TRANSACTION;
            
                    EXECUTE FACTOR_CARGA.SP_INSERT_FACTOR_CARGA @ID_FLOTA, @ID_ORIGEN, @TONELAJE, @FECHA, @FECHA2;
            
                    COMMIT TRANSACTION;
                END
            ELSE
            BEGIN
        --10,11,12)
                IF((FACTOR_CARGA.CONTAIN_ANOTHER_FACTOR(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN)=1))
                BEGIN
                    
                    EXECUTE FACTOR_CARGA.SP_DELETE_FACTOR_CARGA_INSIDE @ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN;
                    --6,7)
                    IF((FACTOR_CARGA.CONTAINED_BY_THE_LEFT(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN))=1)
                    BEGIN
                        SET @ID_FC=FACTOR_CARGA.GET_ID_FOR_THE_LEFT_ONE(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN);
                        EXECUTE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FF @ID_FC,@FECHA_INI;
                    END
                    --1,2,4,5)
                    IF((FACTOR_CARGA.CONTAINED_BY_THE_RIGHT(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN))=1)
                    BEGIN
                        SET @ID_FC=FACTOR_CARGA.GET_ID_FOR_THE_RIGHT_ONE(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN);
                        EXECUTE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FI @ID_FC,@FECHA_FIN;
                    END
                END
                ELSE 
                BEGIN
                    IF((FACTOR_CARGA.CONTAINED_BY_THE_LEFT(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN))=1)
                    BEGIN
                        SET @ID_FC=FACTOR_CARGA.GET_ID_FOR_THE_LEFT_ONE(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN);
                        EXECUTE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FF @ID_FC,@FECHA_INI;
                    END
                    --1,2,4,5)
                    IF((FACTOR_CARGA.CONTAINED_BY_THE_RIGHT(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN))=1)
                    BEGIN
                        SET @ID_FC=FACTOR_CARGA.GET_ID_FOR_THE_RIGHT_ONE(@ID_FLOTA,@ID_ORIGEN,@FECHA_INI,@FECHA_FIN);
                        
                        EXECUTE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FI @ID_FC,@FECHA_FIN;
                    END
                END
            END
                --8,9,13)
            EXECUTE FACTOR_CARGA.SP_INSERT_FACTOR_CARGA @ID_FLOTA,@ID_ORIGEN,@FACTOR,@FECHA_INI,@FECHA_FIN;
            END
        END
        ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].SP_INSERT_TOTAL_EXTRACCION_DR_FULL') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('
        CREATE PROC [PLAN].SP_INSERT_TOTAL_EXTRACCION_DR_FULL(@RAJO VARCHAR(16),@FECHA DATE,@TONELAJE REAL)
        AS 
        BEGIN
            DECLARE @ID_RAJO SMALLINT;
            SET @ID_RAJO=RAJO.GET_ID_RAJO(@RAJO);
            IF([PLAN].IS_IN_TOTAL_EXTRACCION(@ID_RAJO,@FECHA)=0)
            BEGIN 
                EXECUTE [PLAN].SP_INSERT_TOTAL_EXTRACCION_DR @ID_RAJO,@FECHA,@TONELAJE;
            END
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].SP_INSERT_EXTRACCION_ZR_D_FULL') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('
             CREATE PROCEDURE [PLAN].SP_INSERT_EXTRACCION_ZR_D_FULL(@RAJO VARCHAR(16),@ZONA VARCHAR(16),@FECHA DATE,@TONELAJE REAL) AS 
        BEGIN
            DECLARE @ID_RAJO SMALLINT,@ID_ZONA SMALLINT,@ID_ZR SMALLINT;
            SET @ID_RAJO=RAJO.GET_ID_RAJO(@RAJO);
            SET @ID_ZONA=ZONA.GET_ID_ZONA(@ZONA);
            SET @ID_ZR=COMBINACION.GET_ID_ZONA_RAJO(@ID_ZONA,@ID_RAJO);
            IF([PLAN].IS_IN_ZRD(@ID_ZR,@FECHA)=0)
            BEGIN 
                EXECUTE [PLAN].SP_INSERT_EXTRACCION_ZR_D @ID_ZR,@FECHA,@TONELAJE;
            END
        END;
        ')
        END
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FI') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FI
            @ID_FC SMALLINT,
            @FECHA_FIN DATE
        AS
        BEGIN
            DECLARE @FECHA DATE;
            
            SET @FECHA = CAST(DATEADD(DAY, 1, @FECHA_FIN) AS DATE);
            
            UPDATE FACTOR_CARGA.FACTOR_CARGA
            SET FECHA_INI = @FECHA
            WHERE ID_FC = @ID_FC;
        END')
        END;
        
        
        
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FF') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('
        CREATE PROCEDURE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA_FF
            @ID_FC SMALLINT,
            @FECHA_INI DATE
        AS
        BEGIN
            DECLARE @FECHA DATE;
            SET @FECHA = CAST(DATEADD(DAY, -1, @FECHA_INI) AS DATE);
            
            UPDATE FACTOR_CARGA.FACTOR_CARGA
            SET FECHA_FIN = @FECHA
            WHERE ID_FC = @ID_FC;
        END')
        END;
        
        
        
         IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE FACTOR_CARGA.SP_UPDATE_FACTOR_CARGA(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@TONELAJE REAL,@FECHA_INI DATE,@FECHA_FIN DATE) AS
        BEGIN
            UPDATE FACTOR_CARGA.FACTOR_CARGA
            SET TONELAJE=@TONELAJE
            WHERE ID_FLOTA=@ID_FLOTA AND 
                  ID_ORIGEN=@ID_ORIGEN AND
                  FECHA_INI=@FECHA_INI AND
                  FECHA_FIN=@FECHA_FIN AND
                  TONELAJE<> @TONELAJE;
        END;')
        END;
        
         IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.SP_DELETE_FACTOR_CARGA_INSIDE') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE FACTOR_CARGA.SP_DELETE_FACTOR_CARGA_INSIDE(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE) AS
        BEGIN
            DELETE FROM FACTOR_CARGA.FACTOR_CARGA
            WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND
                ((FECHA_INI BETWEEN @FECHA_INI AND @FECHA_FIN) AND
                 (FECHA_FIN BETWEEN @FECHA_INI AND @FECHA_FIN))
        END;')
        END;
        
         IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.SP_DELETE_FACTOR_CARGA') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE FACTOR_CARGA.SP_DELETE_FACTOR_CARGA(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE) AS
        BEGIN
            DELETE FROM FACTOR_CARGA.FACTOR_CARGA
            WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND
                ((FECHA_INI =@FECHA_INI) AND
                 (FECHA_FIN =@FECHA_FIN))
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].GET_REPORTE_DIARIO_RAJO') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE [PLAN].GET_REPORTE_DIARIO_RAJO(@FECHA DATE ,@CORREO VARCHAR(255)) AS
        BEGIN
            WITH REAL_RAJO_DIARIO AS(
                                    SELECT R.ID_RAJO,SUM(CI.FACTOR*CI.VUELTAS)''Extracción''
                                    FROM CICLO.CICLO CI
                                    INNER JOIN RECORRIDO.RECORRIDO RE
                                    ON CI.ID_RECORRIDO=RE.ID_RECORRIDO
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT ODZRM
                                    ON ODZRM.ID_ODZRM=RE.ID_ODZRM
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
                                    ON ODZR.ID_ODZR=ODZRM.ID_ODZR
                                    INNER JOIN COMBINACION.ZONA_RAJO ZR
                                    ON ZR.ID_ZR=ODZR.ID_ZR 
                                    INNER JOIN ZONA.ZONA Z
                                    ON Z.ID_ZONA=ZR.ID_ZONA 
                                    INNER JOIN RAJO.RAJO  R
                                    ON R.ID_RAJO=ZR.ID_RAJO
                                    WHERE CI.FECHA = @FECHA
                                    GROUP BY R.ID_RAJO)
        
            SELECT PTEDR.FECHA,R.NOMBRE ''Rajo'',RRD.Extracción ''Diario Real'',PTEDR.TONELAJE ''Diario Plan''
            FROM REAL_RAJO_DIARIO RRD 
            INNER JOIN [PLAN].TOTAL_EXTRACCION_DR PTEDR
            ON PTEDR.ID_RAJO=RRD.ID_RAJO
            INNER JOIN RAJO.RAJO R
            ON R.ID_RAJO=PTEDR.ID_RAJO
            INNER JOIN USUARIO.PERMISO P
            ON P.ID_RAJO=R.ID_RAJO
            INNER JOIN USUARIO.USUARIO U
            ON U.ID=P.ID_USUARIO
            WHERE PTEDR.FECHA= @FECHA AND U.CORREO LIKE @CORREO
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].GET_REPORTE_DIARIO_FASE') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE [PLAN].GET_REPORTE_DIARIO_FASE(@FECHA DATE ,@CORREO VARCHAR(255)) AS
        BEGIN
            WITH PRODUCCION AS (
                                SELECT ZR.ID_ZR,SUM(CI.FACTOR*CI.VUELTAS) ''Extracción''
                                FROM CICLO.CICLO CI
                                INNER JOIN RECORRIDO.RECORRIDO RE
                                ON CI.ID_RECORRIDO=RE.ID_RECORRIDO
                                INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT ODZRM
                                ON ODZRM.ID_ODZRM=RE.ID_ODZRM
                                INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
                                ON ODZR.ID_ODZR=ODZRM.ID_ODZR
                                INNER JOIN COMBINACION.ZONA_RAJO ZR
                                ON ZR.ID_ZR=ODZR.ID_ZR 
                                INNER JOIN ZONA.ZONA Z
                                ON Z.ID_ZONA=ZR.ID_ZONA 
                                WHERE CI.FECHA = @FECHA AND (Z.ZONA LIKE ''%FASE%'' OR Z.ZONA LIKE ''%F0%'')
                                GROUP BY ZR.ID_ZR
            )
        
            SELECT R.NOMBRE,Z.ZONA,(P.Extracción), ''0'' AS ''Plan''
            FROM PRODUCCION P
            INNER JOIN COMBINACION.ZONA_RAJO ZR 
            ON P.ID_ZR=ZR.ID_ZR 
            INNER JOIN RAJO.RAJO R
            ON R.ID_RAJO=ZR.ID_RAJO
            INNER JOIN ZONA.ZONA Z
            ON Z.ID_ZONA=ZR.ID_ZONA
            INNER JOIN USUARIO.PERMISO PER
            ON PER.ID_RAJO =R.ID_RAJO 
            INNER JOIN USUARIO.USUARIO U
            ON U.ID=PER.ID_USUARIO
            WHERE U.CORREO LIKE @CORREO 
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].GET_REPORTE_SEMANAL_ISO_FASE') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE [PLAN].GET_REPORTE_SEMANAL_ISO_FASE(@FECHA DATE ,@CORREO VARCHAR(255)) AS
        BEGIN
            ---OBTIENE LA PRODUCCION DE LA SEMANA AGRUPADA POR ZONA_RAJO
            WITH PRODUCCION AS(
                                    SELECT ODZR.ID_ZR,SUM(CI.FACTOR*CI.VUELTAS) ''Extracción''
                                    FROM CICLO.CICLO CI
                                    INNER JOIN RECORRIDO.RECORRIDO RE
                                    ON CI.ID_RECORRIDO=RE.ID_RECORRIDO
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT ODZRM
                                    ON ODZRM.ID_ODZRM=RE.ID_ODZRM
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
                                    ON ODZR.ID_ODZR=ODZRM.ID_ODZR
                                    INNER JOIN COMBINACION.ZONA_RAJO ZR
                                    ON ZR.ID_ZR=ODZR.ID_ZR
                                    INNER JOIN ZONA.ZONA Z
                                    ON Z.ID_ZONA=ZR.ID_ZONA
                                    WHERE DATEPART(WK,CI.FECHA) =DATEPART(WK,@FECHA) AND CI.FECHA<=@FECHA AND 
                                    (Z.ZONA LIKE ''%FASE%'' OR Z.ZONA LIKE ''%F0%'')
                                    GROUP BY ODZR.ID_ZR
            )
            SELECT R.NOMBRE,Z.ZONA,P.Extracción,''0'' AS ''Plan''
            FROM PRODUCCION P
            INNER JOIN COMBINACION.ZONA_RAJO ZR
            ON ZR.ID_ZR=P.ID_ZR
            INNER JOIN ZONA.ZONA Z
            ON Z.ID_ZONA=ZR.ID_ZONA
            INNER JOIN RAJO.RAJO R
            ON R.ID_RAJO=ZR.ID_RAJO
            INNER JOIN USUARIO.PERMISO PER
            ON PER.ID_RAJO=R.ID_RAJO 
            INNER JOIN USUARIO.USUARIO U
            ON U.ID=PER.ID_USUARIO
            WHERE  U.CORREO LIKE @CORREO 
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].GET_REPORTE_SEMANAL_MOVIL_FASE') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE [PLAN].GET_REPORTE_SEMANAL_MOVIL_FASE(@FECHA DATE ,@CORREO VARCHAR(255)) AS
        BEGIN
            ---OBTIENE LA prod DE LA SEMANA AGRUPADA POR ZONA_RAJO
            WITH PRODUCCION AS(
                                    SELECT ODZR.ID_ZR,SUM(CI.FACTOR*CI.VUELTAS) ''Extracción''
                                    FROM CICLO.CICLO CI
                                    INNER JOIN RECORRIDO.RECORRIDO RE
                                    ON CI.ID_RECORRIDO=RE.ID_RECORRIDO
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT ODZRM
                                    ON ODZRM.ID_ODZRM=RE.ID_ODZRM
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
                                    ON ODZR.ID_ODZR=ODZRM.ID_ODZR
                                    INNER JOIN COMBINACION.ZONA_RAJO ZR 
                                    ON ZR.ID_ZR=ODZR.ID_ZR 
                                    INNER JOIN ZONA.ZONA Z
                                    ON Z.ID_ZONA=ZR.ID_ZONA
                                    WHERE CI.FECHA BETWEEN CAST(DATEADD(WEEK,-1,@FECHA) AS DATE) AND @FECHA AND 
                                    (Z.ZONA LIKE ''%FASE%'' OR Z.ZONA LIKE ''%F0%'')
        
                                    GROUP BY ODZR.ID_ZR)
        
            SELECT R.NOMBRE ''Rajo'',Z.ZONA,P.Extracción,''0'' AS ''Plan''
            FROM PRODUCCION P
            INNER JOIN COMBINACION.ZONA_RAJO ZR
            ON ZR.ID_ZR=P.ID_ZR
            INNER JOIN ZONA.ZONA Z 
            ON Z.ID_ZONA=ZR.ID_ZONA 
            INNER JOIN RAJO.RAJO R
            ON R.ID_RAJO=ZR.ID_RAJO
            INNER JOIN USUARIO.PERMISO PER
            ON PER.ID_RAJO=ZR.ID_RAJO 
            INNER JOIN USUARIO.USUARIO U
            ON U.ID=PER.ID_USUARIO
            WHERE  U.CORREO LIKE @CORREO 
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].GET_REPORTE_MENSUAL_FASE') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE [PLAN].GET_REPORTE_MENSUAL_FASE(@FECHA DATE ,@CORREO VARCHAR(255)) AS
        BEGIN
            WITH PRODUCCION AS(
                                    SELECT ODZR.ID_ZR,SUM(CI.FACTOR*CI.VUELTAS) ''Extracción''
                                    FROM CICLO.CICLO CI
                                    INNER JOIN RECORRIDO.RECORRIDO RE
                                    ON CI.ID_RECORRIDO=RE.ID_RECORRIDO
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT ODZRM
                                    ON ODZRM.ID_ODZRM=RE.ID_ODZRM
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
                                    ON ODZR.ID_ODZR=ODZRM.ID_ODZR
                                    INNER JOIN COMBINACION.ZONA_RAJO ZR 
                                    ON ZR.ID_ZR=ODZR.ID_ZR 
                                    INNER JOIN ZONA.ZONA Z
                                    ON Z.ID_ZONA=ZR.ID_ZONA
                                    WHERE DATEPART(MONTH,CI.FECHA) =DATEPART(MONTH,@FECHA) AND 
                                    (Z.ZONA LIKE ''%FASE%'' OR Z.ZONA LIKE ''%F0%'')
                                    GROUP BY ODZR.ID_ZR)
        
            SELECT R.NOMBRE ''Rajo'',Z.ZONA,P.Extracción,''0'' AS ''Plan''
            FROM PRODUCCION P
            INNER JOIN COMBINACION.ZONA_RAJO ZR
            ON ZR.ID_ZR=P.ID_ZR
            INNER JOIN ZONA.ZONA Z 
            ON Z.ID_ZONA=ZR.ID_ZONA 
            INNER JOIN RAJO.RAJO R
            ON R.ID_RAJO=ZR.ID_RAJO
            INNER JOIN USUARIO.PERMISO PER
            ON PER.ID_RAJO=ZR.ID_RAJO 
            INNER JOIN USUARIO.USUARIO U
            ON U.ID=PER.ID_USUARIO
            WHERE  U.CORREO LIKE @CORREO
        END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].GET_REPORTE_ANUAL_FASE') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE [PLAN].GET_REPORTE_ANUAL_FASE(@FECHA DATE ,@CORREO VARCHAR(255)) AS
        BEGIN
        ---
            WITH PRODUCCION AS(
                                    SELECT ZR.ID_ZR,SUM(CI.FACTOR*CI.VUELTAS) ''Extracción''
                                    FROM CICLO.CICLO CI
                                    INNER JOIN RECORRIDO.RECORRIDO RE
                                    ON CI.ID_RECORRIDO=RE.ID_RECORRIDO
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT ODZRM
                                    ON ODZRM.ID_ODZRM=RE.ID_ODZRM
                                    INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
                                    ON ODZR.ID_ODZR=ODZRM.ID_ODZR
                                    INNER JOIN COMBINACION.ZONA_RAJO ZR
                                    ON ZR.ID_ZR=ODZR.ID_ZR
                                    INNER JOIN ZONA.ZONA Z
                                    ON Z.ID_ZONA=ZR.ID_ZONA
                                    WHERE DATEPART(YEAR,CI.FECHA) =DATEPART(YEAR,@FECHA) AND 
                                    (Z.ZONA LIKE ''%FASE%'' OR Z.ZONA LIKE ''%F0%'')
                                    GROUP BY ZR.ID_ZR)
        
            SELECT R.NOMBRE ''Rajo'',Z.ZONA,P.Extracción,''0'' AS ''Plan''
            FROM PRODUCCION P
            INNER JOIN COMBINACION.ZONA_RAJO ZR
            ON ZR.ID_ZR=P.ID_ZR
            INNER JOIN ZONA.ZONA Z 
            ON Z.ID_ZONA=ZR.ID_ZONA 
            INNER JOIN RAJO.RAJO R
            ON R.ID_RAJO=ZR.ID_RAJO
            INNER JOIN USUARIO.PERMISO PER
            ON PER.ID_RAJO=ZR.ID_RAJO 
            INNER JOIN USUARIO.USUARIO U
            ON U.ID=PER.ID_USUARIO
            WHERE  U.CORREO LIKE @CORREO
        END;')
        END;
        
        ---------------------------------///FUNCTIONS---------------------------
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CAMION.IS_IN_CAMION') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION Camion.IS_IN_CAMION(@CODIGO VARCHAR(16))
            RETURNS BIT
            AS
            BEGIN
                IF(@CODIGO IN (SELECT CODIGO FROM CAMION.CAMION))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CAMION.IS_IN_FLOTA') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION CAMION.IS_IN_FLOTA(@CODIGO VARCHAR(16))
            RETURNS BIT
            AS
            BEGIN
                    IF EXISTS (SELECT ID_FLOTA FROM CAMION.FLOTA WHERE CODIGO=@CODIGO)
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
         
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.IS_IN_CICLO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION CICLO.IS_IN_CICLO(@FECHA DATE, @ID_RECORRIDO INT)
            RETURNS BIT
            AS
            BEGIN
                IF EXISTS (SELECT ID_CICLO FROM CICLO.CICLO WHERE FECHA = @FECHA AND
                                                              ID_RECORRIDO = @ID_RECORRIDO)
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.IS_IN_ORI_DEST_ZON_RAJ') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION COMBINACION.IS_IN_ORI_DEST_ZON_RAJ(@ID_OD SMALLINT,@ID_ZR SMALLINT)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS(SELECT ID_ODZR FROM COMBINACION.ORI_DEST_ZON_RAJ WHERE ID_OD=@ID_OD AND ID_ZR=@ID_ZR))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.IS_IN_ORI_DEST_ZON_RAJ_MAT') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION COMBINACION.IS_IN_ORI_DEST_ZON_RAJ_MAT(@ID_MATERIAL SMALLINT, @ID_ODZR SMALLINT)
            RETURNS BIT
            AS
            BEGIN
                IF(EXISTS (SELECT ID_ODZRM FROM COMBINACION.ORI_DEST_ZON_RAJ_MAT WHERE ID_MATERIAL = @ID_MATERIAL AND ID_ODZR = @ID_ODZR))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.IS_IN_ORIGEN_DESTINO') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION COMBINACION.IS_IN_ORIGEN_DESTINO(@ID_ORIGEN SMALLINT, @ID_DESTINO SMALLINT)
            RETURNS BIT
            AS
            BEGIN
                IF(EXISTS (SELECT ID_OD FROM COMBINACION.ORIGEN_DESTINO WHERE ID_ORIGEN = @ID_ORIGEN AND ID_DESTINO = @ID_DESTINO))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.IS_IN_PALA_CAMION') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION COMBINACION.IS_IN_PALA_CAMION(@ID_PALA SMALLINT, @ID_CAMION SMALLINT)
            RETURNS BIT
            AS
            BEGIN
                IF (EXISTS (SELECT ID_PC FROM COMBINACION.PALA_CAMION WHERE ID_PALA = @ID_PALA AND ID_CAMION = @ID_CAMION))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.IS_IN_USER_RAJO') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION COMBINACION.IS_IN_USER_RAJO(@ID_RAJO TINYINT, @ID_USER SMALLINT)
            RETURNS BIT
            AS
            BEGIN
                IF(EXISTS (SELECT ID_UR FROM COMBINACION.USER_RAJO WHERE ID_RAJO = @ID_RAJO AND ID_USER = @ID_USER))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.IS_IN_ZONA_RAJO') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION COMBINACION.IS_IN_ZONA_RAJO(@ID_ZONA SMALLINT, @ID_RAJO TINYINT)
            RETURNS BIT
            AS
            BEGIN
                IF(EXISTS (SELECT ID_ZR FROM COMBINACION.ZONA_RAJO WHERE ID_ZONA = @ID_ZONA AND ID_RAJO = @ID_RAJO))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'Material.IS_IN_MATERIAL') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION Material.IS_IN_MATERIAL(@MATERIAL VARCHAR(32))
            RETURNS BIT
            AS
            BEGIN
                IF(@MATERIAL IN (SELECT NOMBRE FROM Material.MATERIAL))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'PALA.IS_IN_PALA') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION PALA.IS_IN_PALA(@CODIGO VARCHAR(16))
                RETURNS BIT
                AS
                BEGIN
                    IF(@CODIGO IN (SELECT CODIGO FROM Pala.PALA))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'RAJO.IS_IN_RAJO') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION RAJO.IS_IN_RAJO(@RAJO VARCHAR(16))
            RETURNS BIT 
            BEGIN
                IF(@RAJO IN (SELECT NOMBRE FROM Rajo.RAJO))
                BEGIN
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'RECORRIDO.IS_IN_RECORRIDO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION RECORRIDO.IS_IN_RECORRIDO(@ID_ODZRM SMALLINT,@ID_PC SMALLINT)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS(SELECT ID_RECORRIDO FROM RECORRIDO.RECORRIDO WHERE ID_ODZRM=@ID_ODZRM AND ID_PC=@ID_PC))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SECTOR.IS_IN_SECTOR') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION SECTOR.IS_IN_SECTOR(@NOMBRE VARCHAR(24))
                RETURNS BIT
                AS
                BEGIN
                    IF(@NOMBRE IN (SELECT NOMBRE FROM SECTOR.SECTOR))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.IS_IN_USUARIO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION USUARIO.IS_IN_USUARIO(@EMAIL VARCHAR(255))
                RETURNS BIT
                AS
                BEGIN
                    IF(@EMAIL IN (SELECT CORREO FROM USUARIO.USUARIO))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ZONA.IS_IN_ZONA') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION ZONA.IS_IN_ZONA(@ZONA VARCHAR(16))
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS (SELECT ZONA FROM ZONA.ZONA WHERE ZONA=@ZONA))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CAMION.GET_ID_CAMION') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION CAMION.GET_ID_CAMION(@CODIGO VARCHAR(16))
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_CAMION FROM CAMION.CAMION WHERE CODIGO=@CODIGO)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CAMION.GET_ID_FLOTA') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION CAMION.GET_ID_FLOTA(@CODIGO VARCHAR(16))
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_FLOTA FROM CAMION.FLOTA WHERE CODIGO=@CODIGO)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.GET_ID_CICLO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION CICLO.GET_ID_CICLO(@FECHA DATE,@ID_RECORRIDO INT)
                RETURNS INT
                AS
                BEGIN
                    RETURN(SELECT ID_CICLO FROM CICLO.CICLO WHERE FECHA=@FECHA AND ID_RECORRIDO=@ID_RECORRIDO)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.GET_ID_ORI_DEST_ZON_RAJ') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION COMBINACION.GET_ID_ORI_DEST_ZON_RAJ(@ID_OD SMALLINT,@ID_ZR SMALLINT)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_ODZR FROM COMBINACION.ORI_DEST_ZON_RAJ WHERE ID_OD=@ID_OD AND ID_ZR=@ID_ZR)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.GET_ID_ORI_DEST_ZON_RAJ_MAT') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION COMBINACION.GET_ID_ORI_DEST_ZON_RAJ_MAT(@ID_MATERIAL SMALLINT, @ID_ODZR SMALLINT)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_ODZRM FROM COMBINACION.ORI_DEST_ZON_RAJ_MAT WHERE ID_MATERIAL=@ID_MATERIAL AND ID_ODZR=@ID_ODZR)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.GET_ID_ORIGEN_DESTINO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION COMBINACION.GET_ID_ORIGEN_DESTINO(@ID_ORIGEN SMALLINT,@ID_DESTINO SMALLINT)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_OD FROM COMBINACION.ORIGEN_DESTINO WHERE ID_ORIGEN=@ID_ORIGEN AND ID_DESTINO=@ID_DESTINO)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.GET_ID_PALA_CAMION') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION COMBINACION.GET_ID_PALA_CAMION(@ID_PALA SMALLINT,@ID_CAMION SMALLINT)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_PC FROM COMBINACION.PALA_CAMION WHERE ID_PALA=@ID_PALA AND ID_CAMION=@ID_CAMION)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'COMBINACION.GET_ID_ZONA_RAJO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION COMBINACION.GET_ID_ZONA_RAJO(@ID_ZONA SMALLINT,@ID_RAJO TINYINT)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_ZR FROM COMBINACION.ZONA_RAJO WHERE ID_ZONA=@ID_ZONA AND ID_RAJO=@ID_RAJO)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'MATERIAL.GET_ID_MATERIAL') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION MATERIAL.GET_ID_MATERIAL(@NOMBRE VARCHAR(32))
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_MATERIAL FROM MATERIAL.MATERIAL WHERE NOMBRE=@NOMBRE)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'PALA.GET_ID_PALA') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION PALA.GET_ID_PALA(@CODIGO VARCHAR(16))
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_PALA FROM PALA.PALA WHERE CODIGO=@CODIGO)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'RAJO.GET_ID_RAJO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION RAJO.GET_ID_RAJO(@NOMBRE VARCHAR(16))
                RETURNS TINYINT
                AS
                BEGIN
                    RETURN(SELECT ID_RAJO FROM RAJO.RAJO WHERE NOMBRE=@NOMBRE)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'RECORRIDO.GET_ID_RECORRIDO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION RECORRIDO.GET_ID_RECORRIDO(@ID_ODZRM SMALLINT,@ID_PC SMALLINT)
                RETURNS INT
                AS
                BEGIN
                    RETURN(SELECT ID_RECORRIDO FROM RECORRIDO.RECORRIDO WHERE ID_ODZRM=@ID_ODZRM AND ID_PC=@ID_PC)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SECTOR.GET_ID_SECTOR') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION SECTOR.GET_ID_SECTOR(@NOMBRE VARCHAR(24))
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_SECTOR FROM SECTOR.SECTOR WHERE NOMBRE=@NOMBRE)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ZONA.GET_ID_ZONA') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION ZONA.GET_ID_ZONA(@ZONA VARCHAR(16))
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_ZONA FROM ZONA.ZONA WHERE ZONA LIKE @ZONA)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.GET_VUELTAS') AND type = 'FN')
        BEGIN
                EXEC('
                 CREATE FUNCTION CICLO.GET_VUELTAS(@ID_CICLO INT)
                RETURNS REAL
                AS
                BEGIN
                    RETURN(SELECT VUELTAS FROM CICLO.CICLO WHERE ID_CICLO=@ID_CICLO)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'SECTOR.GET_TYPE_SECTOR') AND type = 'FN')
        BEGIN
            EXEC('
            CREATE FUNCTION SECTOR.GET_TYPE_SECTOR(@ZONA VARCHAR(16), @RAJO VARCHAR(16), @SECTOR VARCHAR(25))
            RETURNS CHAR(1)
            AS
            BEGIN
                DECLARE @TIPO CHAR(1);
                SET @TIPO = CASE
                    WHEN @SECTOR LIKE ''%BOT%'' OR 
                         @SECTOR LIKE ''DESCARGA_PLATAFORMA'' OR 
                         @SECTOR LIKE ''MOD D'' OR 
                         @SECTOR LIKE ''%INCHANCABLES%'' THEN ''B''
                    WHEN @SECTOR LIKE ''%CHANCADO%'' THEN ''C''
                    WHEN @SECTOR LIKE ''%PRETIL%'' THEN ''P''
                    WHEN @ZONA LIKE ''%'' + @RAJO + ''%'' OR 
                         @RAJO = ''TESORO'' AND @ZONA = ''OXIDO'' OR 
                         @SECTOR LIKE ''%ST%'' OR 
                         @SECTOR LIKE ''^MOD_[ABCEFG]_REM$'' OR 
                         @SECTOR LIKE ''^MOD [ABCEFG]$'' OR 
                         @SECTOR LIKE ''%ROM%'' OR 
                         @SECTOR LIKE ''%PLATAFORMA_ESS%'' THEN ''S''
                    WHEN @ZONA LIKE ''%F0%'' OR 
                         @ZONA LIKE ''%FASE%'' THEN ''F''
                    ELSE ''N''
                END;
                RETURN @TIPO;
            END;
            ')
        END;
        
         
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.GET_FACTOR') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION CICLO.GET_FACTOR(@ID_CICLO INT)
                RETURNS REAL
                AS
                BEGIN
                    RETURN(SELECT FACTOR FROM CICLO.CICLO WHERE ID_CICLO=@ID_CICLO)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.CONTAIN_ANOTHER_FACTOR') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION FACTOR_CARGA.CONTAIN_ANOTHER_FACTOR(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS(SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE @ID_FLOTA=ID_FLOTA AND @ID_ORIGEN=ID_ORIGEN AND
                                                                                ((FECHA_INI BETWEEN @FECHA_INI AND @FECHA_FIN) AND
                                                                                 (FECHA_FIN BETWEEN @FECHA_INI AND @FECHA_FIN))))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
        
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.GET_ID') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION USUARIO.GET_ID(@CORREO VARCHAR(255))
        RETURNS SMALLINT 
        BEGIN
        
            RETURN (SELECT ID FROM USUARIO.USUARIO WHERE CORREO LIKE @CORREO)
        
        END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.IS_IN_PERMISO') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION USUARIO.IS_IN_PERMISO(@ID_USUARIO SMALLINT,@ID_RAJO TINYINT)
        RETURNS BIT
        BEGIN
            IF(EXISTS (SELECT * FROM USUARIO.PERMISO WHERE ID_RAJO=@ID_RAJO AND ID_USUARIO=@ID_USUARIO))
            BEGIN 
                RETURN 1;
            END
            RETURN 0;
        END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.TRANSFER_PERMISSION') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE USUARIO.TRANSFER_PERMISSION(@ADMIN_CORREO VARCHAR(255),@NEW_USER_CORREO VARCHAR(255),@PASSWORD VARCHAR(255)) 
        AS 
        BEGIN
            DECLARE @ID_ADMIN SMALLINT,@ID_USER SMALLINT,@ID_RAJO TINYINT;
            
            EXECUTE USUARIO.SP_INSERT_USUARIO 0,@NEW_USER_CORREO,@PASSWORD;
            SET @ID_ADMIN=USUARIO.GET_ID(@ADMIN_CORREO);
            SET @ID_USER =USUARIO.GET_ID(@NEW_USER_CORREO);
            
            DECLARE TempCursor CURSOR FOR
            SELECT ID_RAJO
            FROM USUARIO.PERMISO 
            WHERE ID_USUARIO = @ID_ADMIN
        
            OPEN TempCursor;
        
            FETCH NEXT FROM TempCursor INTO @ID_RAJO;
        
            WHILE @@FETCH_STATUS = 0
            BEGIN
                INSERT INTO USUARIO.PERMISO(ID_RAJO,ID_USUARIO) VALUES(@ID_RAJO,@ID_USER);
        
                FETCH NEXT FROM TempCursor INTO @ID_RAJO;
            END;
        
            CLOSE TempCursor;
            DEALLOCATE TempCursor;
        END;
        ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.GET_FACTOR_BY_DATE') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION FACTOR_CARGA.GET_FACTOR_BY_DATE(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA DATE)
                RETURNS REAL
                AS
                BEGIN
                    RETURN(SELECT TOP 1 TONELAJE FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_ORIGEN=@ID_ORIGEN AND ID_FLOTA=@ID_FLOTA AND 
                                                                                      (@FECHA BETWEEN FECHA_INI AND FECHA_FIN))
                END;
                ')
        END;
        
        
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.CICLO_IS_FACTOR_CARGA') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION CICLO.CICLO_IS_FACTOR_CARGA(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA DATE)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS (SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND 
                                                                                 (@FECHA BETWEEN FECHA_INI AND FECHA_FIN)))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'CICLO.CICLO_IS_FACTOR_CARGA') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION CICLO.CICLO_IS_FACTOR_CARGA(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA DATE)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS (SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND 
                                                                                 (@FECHA BETWEEN FECHA_INI AND FECHA_FIN)))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.FI_LIKE_FI') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION FACTOR_CARGA.FI_LIKE_FI(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS (SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND 
                                                                                 (FECHA_INI=@FECHA_INI)))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.FF_LIKE_FF') AND type = 'FN')
        BEGIN
                EXEC('
                 CREATE FUNCTION FACTOR_CARGA.FF_LIKE_FF(@ID_FLOTA SMALLINT,@ID_ORIGEN TINYINT,@FECHA_FIN DATE)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS (SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND 
                                                                                 (FECHA_FIN=@FECHA_FIN)))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.CONTAINED_BY_THE_LEFT') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION FACTOR_CARGA.CONTAINED_BY_THE_LEFT(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS (SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND 
                                                                                 (FECHA_INI<@FECHA_INI) AND
                                                                                 (FECHA_FIN<@FECHA_FIN) AND
                                                                                 (@FECHA_FIN>=FECHA_INI)))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.CONTAINED_BY_THE_RIGHT') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION FACTOR_CARGA.CONTAINED_BY_THE_RIGHT(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS (SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND 
                                                                                 (@FECHA_INI<FECHA_INI) AND 
                                                                                 (FECHA_FIN>@FECHA_FIN) AND
                                                                                 (@FECHA_INI<=FECHA_FIN)))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.INSIDE_ANOTHER') AND type = 'FN')
        BEGIN
                EXEC('
                 CREATE FUNCTION FACTOR_CARGA.INSIDE_ANOTHER(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE)
                RETURNS BIT
                AS
                BEGIN
                    IF(EXISTS (SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_FLOTA=@ID_FLOTA AND ID_ORIGEN=@ID_ORIGEN AND 
                                                                                 ((FECHA_INI<@FECHA_INI) AND
                                                                                  (FECHA_FIN>@FECHA_FIN))))
                    BEGIN 
                        RETURN 1;
                    END;
                    RETURN 0;
                END;
                ')
        END;
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.GET_ID_FACTOR_CARGA') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION FACTOR_CARGA.GET_ID_FACTOR_CARGA(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_FC FROM FACTOR_CARGA.FACTOR_CARGA WHERE ID_FLOTA=@ID_FLOTA AND @ID_ORIGEN=ID_ORIGEN AND FECHA_INI=@FECHA_INI AND FECHA_FIN=@FECHA_FIN)
                END;
                ')
        END;
         
        
        ---ADENTRO DE CUAL ESTA 
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.GET_ID_FOR_INSIDE') AND type = 'FN')
        BEGIN
                EXEC('
                 CREATE FUNCTION FACTOR_CARGA.GET_ID_FOR_INSIDE(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_FC 
                           FROM FACTOR_CARGA.FACTOR_CARGA 
                           WHERE ID_FLOTA=@ID_FLOTA AND 
                                 ID_ORIGEN=@ID_ORIGEN AND 
                                 FECHA_INI<@FECHA_INI AND 
                                 FECHA_FIN>@FECHA_FIN)
                END;
                ')
        END;
        --TOMADO POR LA IZQUIERDA DE QUIEN
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.GET_ID_FOR_THE_LEFT_ONE') AND type = 'FN')
        BEGIN
                EXEC('
                 CREATE FUNCTION FACTOR_CARGA.GET_ID_FOR_THE_LEFT_ONE(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_FC 
                           FROM FACTOR_CARGA.FACTOR_CARGA 
                           WHERE ID_FLOTA=@ID_FLOTA AND 
                                 ID_ORIGEN=@ID_ORIGEN AND 
                                 FECHA_INI<@FECHA_INI AND
                                 FECHA_FIN<@FECHA_FIN AND
                                 FECHA_FIN>@FECHA_INI)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.GET_ID_FOR_THE_RIGHT_ONE') AND type = 'FN')
        BEGIN
                EXEC('
                 CREATE FUNCTION FACTOR_CARGA.GET_ID_FOR_THE_RIGHT_ONE(@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@FECHA_INI DATE,@FECHA_FIN DATE)
                RETURNS SMALLINT
                AS
                BEGIN
                    RETURN(SELECT ID_FC 
                           FROM FACTOR_CARGA.FACTOR_CARGA 
                           WHERE ID_FLOTA=@ID_FLOTA AND 
                                 ID_ORIGEN=@ID_ORIGEN AND 
                                 FECHA_FIN > @FECHA_FIN AND
                                 FECHA_INI>@FECHA_INI AND
                                 FECHA_INI<@FECHA_FIN)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.GET_FECHA_FIN') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION FACTOR_CARGA.GET_FECHA_FIN(@ID_FC SMALLINT)
                RETURNS DATE
                AS
                BEGIN
                    RETURN(SELECT FECHA_FIN 
                           FROM FACTOR_CARGA.FACTOR_CARGA 
                           WHERE ID_FC=@ID_FC)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.GET_TONELAJE_BY_ID') AND type = 'FN')
        BEGIN
                EXEC('
                CREATE FUNCTION FACTOR_CARGA.GET_TONELAJE_BY_ID(@ID_FC SMALLINT)
                RETURNS REAL
                AS
                BEGIN
                    RETURN(SELECT TONELAJE 
                           FROM FACTOR_CARGA.FACTOR_CARGA 
                           WHERE ID_FC=@ID_FC)
                END;
                ')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].IS_IN_ZRD') AND type = 'FN')
        BEGIN
            EXEC('
           CREATE FUNCTION [PLAN].IS_IN_ZRD(@ID_ZR SMALLINT,@FECHA DATE)
            RETURNS BIT
            AS
            BEGIN
                IF(EXISTS(SELECT * FROM [PLAN].EXTRACCION_ZR_D WHERE ID_ZR=@ID_ZR AND FECHA=@FECHA))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[PLAN].IS_IN_TOTAL_EXTRACCION') AND type = 'FN')
        BEGIN
            EXEC('
           CREATE FUNCTION [PLAN].IS_IN_TOTAL_EXTRACCION(@ID_RAJO TINYINT,@FECHA DATE)
            RETURNS BIT
            AS
            BEGIN
                IF(EXISTS(SELECT * FROM [PLAN].TOTAL_EXTRACCION_DR WHERE ID_RAJO=@ID_RAJO AND FECHA=@FECHA))
                BEGIN 
                    RETURN 1;
                END;
                RETURN 0;
            END;
            ');
        END;
        
        
        ---------------------------------///TRIGGERS---------------------------
        
         IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.TR_FACTOR_CARGA_DELET') AND type in (N'TR'))
        BEGIN
                   EXEC('CREATE TRIGGER FACTOR_CARGA.TR_FACTOR_CARGA_DELET
                ON FACTOR_CARGA.FACTOR_CARGA
                AFTER DELETE
                AS
                BEGIN
                    DECLARE @ID_FC SMALLINT,@ID_FLOTA SMALLINT,@ID_ORIGEN SMALLINT,@TONELAJE REAL,@FECHA_INI DATE, @FECHA_FIN DATE;
                    DECLARE FILA CURSOR FAST_FORWARD FOR 
                    SELECT  ID_FC,ID_FLOTA,ID_ORIGEN,TONELAJE,FECHA_INI,FECHA_FIN
                    FROM deleted
        
                    OPEN FILA
        
                    FETCH NEXT FROM FILA 
                    INTO @ID_FC,@ID_FLOTA,@ID_ORIGEN,@TONELAJE,@FECHA_INI,@FECHA_FIN;
        
                    WHILE @@FETCH_STATUS=0
                    BEGIN
                        EXECUTE FACTOR_CARGA.SP_INSERT_DELETED @ID_FC,@ID_FLOTA,@ID_ORIGEN,@TONELAJE,@FECHA_INI,@FECHA_FIN;
                        FETCH NEXT FROM FILA
                        INTO @ID_FC,@ID_FLOTA,@ID_ORIGEN,@TONELAJE,@FECHA_INI,@FECHA_FIN;
                    END	;
                    CLOSE FILA;
                    DEALLOCATE FILA;
                END;')
        END;
        
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'USUARIO.GET_PERMISSIONS') AND type in (N'P', N'PC'))
        BEGIN
           EXEC('CREATE PROCEDURE USUARIO.GET_PERMISSIONS(@CORREO VARCHAR(255))
        AS
        BEGIN 
            WITH USER_FILTER AS(
                    SELECT U.ID,U.CORREO
                    FROM USUARIO.USUARIO U
                    WHERE CORREO LIKE @CORREO
        )
        
        SELECT R.NOMBRE, CASE
                   WHEN U.CORREO IS NULL THEN ''False''
                   ELSE ''True''
               END AS ''Permiso''
            FROM USER_FILTER U
            INNER JOIN USUARIO.PERMISO P
            ON U.ID=P.ID_USUARIO 
            RIGHT JOIN RAJO.RAJO R
            ON R.ID_RAJO=P.ID_RAJO
        END;')
        END;
        
         IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.TR_FACTOR_CARGA_UPDATE') AND type in (N'TR'))
        BEGIN
                   EXEC('CREATE TRIGGER FACTOR_CARGA.TR_FACTOR_CARGA_UPDATE
                ON FACTOR_CARGA.FACTOR_CARGA
                AFTER UPDATE
                AS
                BEGIN
                    DELETE FROM FACTOR_CARGA.FACTOR_CARGA
                    WHERE FECHA_INI > FECHA_FIN 
                END;')
        END;
        
         IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.TR_FACTOR_CARGA_UPDATE_2') AND type in (N'TR'))
        BEGIN
                   EXEC('CREATE TRIGGER FACTOR_CARGA.TR_FACTOR_CARGA_UPDATE_2
                ON FACTOR_CARGA.FACTOR_CARGA
                AFTER UPDATE
                AS
                BEGIN
                    DECLARE @ID_FLOTA SMALLINT,@ID_ORIGEN TINYINT,@TONELAJE REAL,@FECHA_INI DATE, @FECHA_FIN DATE;
                    DECLARE FILA CURSOR FAST_FORWARD FOR 
                    SELECT  I.ID_FLOTA,I.ID_ORIGEN,I.TONELAJE,I.FECHA_INI,I.FECHA_FIN
                    FROM inserted I
                    INNER JOIN deleted D
                    ON I.ID_FC=D.ID_FC
                    WHERE I.TONELAJE<>D.TONELAJE
        
                    OPEN FILA
        
                    FETCH NEXT FROM FILA 
                    INTO @ID_FLOTA,@ID_ORIGEN,@TONELAJE,@FECHA_INI,@FECHA_FIN;
        
                    WHILE @@FETCH_STATUS=0
                    BEGIN
                        UPDATE CICLO.CICLO 
                        SET CICLO.FACTOR=@TONELAJE
                        FROM 
                        CICLO.CICLO CI 
                        INNER JOIN RECORRIDO.RECORRIDO RE
                        ON RE.ID_RECORRIDO=CI.ID_RECORRIDO
                        INNER JOIN COMBINACION.PALA_CAMION PC
                        ON PC.ID_PC=RE.ID_PC
                        INNER JOIN CAMION.CAMION C
                        ON PC.ID_CAMION=C.ID_CAMION
                        INNER JOIN CAMION.FLOTA CF
                        ON CF.ID_FLOTA=C.ID_FLOTA
                        INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT ODZRM
                        ON RE.ID_ODZRM=ODZRM.ID_ODZRM
                        INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
                        ON ODZR.ID_ODZR=ODZRM.ID_ODZR
                        INNER JOIN COMBINACION.ORIGEN_DESTINO OD
                        ON OD.ID_OD=ODZR.ID_OD 
                        WHERE OD.ID_ORIGEN=@ID_ORIGEN AND 
                              CF.ID_FLOTA=@ID_FLOTA AND
                             (CI.FECHA BETWEEN @FECHA_INI AND @FECHA_FIN)		
                        FETCH NEXT FROM FILA
                        INTO @ID_FLOTA,@ID_ORIGEN,@TONELAJE,@FECHA_INI,@FECHA_FIN;
                    END	;
                    CLOSE FILA;
                    DEALLOCATE FILA;
                END')
        END;
        
         IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'FACTOR_CARGA.TR_FACTOR_CARGA_INSERT') AND type in (N'TR'))
        BEGIN
                   EXEC('CREATE TRIGGER FACTOR_CARGA.TR_FACTOR_CARGA_INSERT
                ON FACTOR_CARGA.FACTOR_CARGA
                AFTER INSERT
                AS
                BEGIN
                    DECLARE @ID_FLOTA SMALLINT,@ID_ORIGEN TINYINT,@TONELAJE REAL,@FECHA_INI DATE, @FECHA_FIN DATE;
                    DECLARE FILA CURSOR FAST_FORWARD FOR 
                    SELECT  ID_FLOTA,ID_ORIGEN,TONELAJE,FECHA_INI,FECHA_FIN
                    FROM inserted
        
                    OPEN FILA
        
                    FETCH NEXT FROM FILA 
                    INTO @ID_FLOTA,@ID_ORIGEN,@TONELAJE,@FECHA_INI,@FECHA_FIN;
        
                    WHILE @@FETCH_STATUS=0
                    BEGIN
                        UPDATE CICLO.CICLO 
                        SET CICLO.FACTOR=@TONELAJE
                        FROM 
                        CICLO.CICLO CI 
                        INNER JOIN RECORRIDO.RECORRIDO RE
                        ON RE.ID_RECORRIDO=CI.ID_RECORRIDO
                        INNER JOIN COMBINACION.PALA_CAMION PC
                        ON PC.ID_PC=RE.ID_PC
                        INNER JOIN CAMION.CAMION C
                        ON PC.ID_CAMION=C.ID_CAMION
                        INNER JOIN CAMION.FLOTA CF
                        ON CF.ID_FLOTA=C.ID_FLOTA
                        INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ_MAT ODZRM
                        ON RE.ID_ODZRM=ODZRM.ID_ODZRM
                        INNER JOIN COMBINACION.ORI_DEST_ZON_RAJ ODZR
                        ON ODZR.ID_ODZR=ODZRM.ID_ODZR
                        INNER JOIN COMBINACION.ORIGEN_DESTINO OD
                        ON OD.ID_OD=ODZR.ID_OD 
                        WHERE OD.ID_ORIGEN=@ID_ORIGEN AND 
                              CF.ID_FLOTA=@ID_FLOTA AND
                             (CI.FECHA BETWEEN @FECHA_INI AND @FECHA_FIN)
                        FETCH NEXT FROM FILA
                        INTO @ID_FLOTA,@ID_ORIGEN,@TONELAJE,@FECHA_INI,@FECHA_FIN;
                    END	;
                    CLOSE FILA;
                    DEALLOCATE FILA;
                END')
        END;
        
        `);
    console.log("End.")
}

module.exports = firstRun;