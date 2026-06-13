// components/admin/SvcConfigTable.tsx
'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { admin } from '@/lib/api'
import { useToast } from '@/hooks/useToast'

interface SvcConfigTableProps {
  svcs: any[]
  onSaved: (svc: any) => void
}

const NUMERIC_FIELDS = ['uts_res', 'uts_com', 'uts_ind', 'piso', 'teto', 'art_fee', 'sla_dias'] as const

export function SvcConfigTable({ svcs, onSaved }: SvcConfigTableProps) {
  const { toast } = useToast()
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const valorAtual = (svc: any, campo: string) => {
    const editado = edits[svc.codigo]?.[campo]
    if (editado !== undefined) return editado
    return svc[campo] ?? ''
  }

  const alterar = (codigo: string, campo: string, valor: string) => {
    setEdits(prev => ({ ...prev, [codigo]: { ...prev[codigo], [campo]: valor } }))
  }

  const temAlteracao = (codigo: string) => !!edits[codigo] && Object.keys(edits[codigo]).length > 0

  const salvar = async (svc: any) => {
    const alteracoes = edits[svc.codigo]
    if (!alteracoes) return
    setSaving(svc.codigo)
    try {
      const { svc: atualizado } = await admin.atualizarSvc(svc.codigo, alteracoes)
      onSaved(atualizado)
      setEdits(prev => {
        const next = { ...prev }
        delete next[svc.codigo]
        return next
      })
      toast(`${svc.codigo} atualizado`, 'success')
    } catch (err: any) {
      toast(err.message || 'Erro ao salvar', 'error')
    } finally {
      setSaving(null)
    }
  }

  const toggleAtivo = async (svc: any) => {
    setSaving(svc.codigo)
    try {
      const { svc: atualizado } = await admin.atualizarSvc(svc.codigo, { ativo: !svc.ativo })
      onSaved(atualizado)
      toast(`${svc.codigo} ${atualizado.ativo ? 'ativado' : 'desativado'}`, 'success')
    } catch (err: any) {
      toast(err.message || 'Erro ao salvar', 'error')
    } finally {
      setSaving(null)
    }
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>SVC</th>
          <th>Nome</th>
          <th>UTS Res</th>
          <th>UTS Com</th>
          <th>UTS Ind</th>
          <th>Piso</th>
          <th>Teto</th>
          <th>ART fee</th>
          <th>SLA dias</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {svcs.map(svc => (
          <tr key={svc.codigo}>
            <td className="font-mono">{svc.codigo}</td>
            <td style={{ color: 'var(--text)' }}>{svc.nome}</td>
            {NUMERIC_FIELDS.map(campo => (
              <td key={campo}>
                <input
                  className="input input-sm"
                  style={{ width: campo === 'sla_dias' ? '4rem' : '5rem' }}
                  type="number"
                  step="any"
                  value={valorAtual(svc, campo)}
                  onChange={e => alterar(svc.codigo, campo, e.target.value)}
                />
              </td>
            ))}
            <td>
              <button onClick={() => toggleAtivo(svc)} disabled={saving === svc.codigo} className="cursor-pointer">
                <Badge variant={svc.ativo ? 'green' : 'glass'}>{svc.ativo ? 'Ativo' : 'Inativo'}</Badge>
              </button>
            </td>
            <td>
              {temAlteracao(svc.codigo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={saving === svc.codigo}
                  onClick={() => salvar(svc)}
                >
                  {saving === svc.codigo ? 'Salvando...' : 'Salvar'}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
